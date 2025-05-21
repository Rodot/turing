import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type SnackbarType = "success" | "error" | "warning" | "info";

interface SnackbarMessage {
  id: number;
  message: string;
  type: AlertColor;
}

interface SnackbarContextType {
  show: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbarQueue, setSnackbarQueue] = useState<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<SnackbarMessage | null>(
    null,
  );
  const DISPLAY_DURATION = 3000;

  useEffect(() => {
    if (snackbarQueue.length > 0 && !open) {
      // Show the next message in queue
      const nextMessage = snackbarQueue[0];
      if (nextMessage) {
        setCurrentMessage(nextMessage);
        setSnackbarQueue((prev) => prev.slice(1));
        setOpen(true);
      }
    }
  }, [snackbarQueue, open]);

  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    const newMessage: SnackbarMessage = {
      id: Date.now(),
      message,
      type,
    };

    setSnackbarQueue((prev) => [...prev, newMessage]);
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    // Reset the current message after the close animation
    setTimeout(() => {
      setCurrentMessage(null);
    }, 300);
  };

  return (
    <SnackbarContext.Provider value={{ show: showSnackbar }}>
      {children}
      {currentMessage && (
        <Snackbar
          open={open}
          autoHideDuration={DISPLAY_DURATION}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={currentMessage.type}
            sx={{ width: "100%" }}
          >
            {currentMessage.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
