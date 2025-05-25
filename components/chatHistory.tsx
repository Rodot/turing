import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { List, Fab, Box, Typography } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ChatMessage } from "./chatMessage";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useMessagesQuery } from "@/hooks/useMessagesQuery";
import { useGameQuery } from "@/hooks/useGameQuery";

export const ChatHistory: React.FC = () => {
  const { t } = useTranslation();
  const userQuery = useUserQuery();
  const messagesQuery = useMessagesQuery();
  const messages = useMemo(
    () =>
      (messagesQuery.data || []).filter((message) => message.type !== "status"),
    [messagesQuery.data]
  );
  const gameQuery = useGameQuery();
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const scrollStateRef = useRef({
    isNearBottom: true,
    lastChecked: Date.now(),
  });

  const scrollToBottom = useCallback(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasUnreadMessages(false);
  }, []);

  const checkScrollPosition = useCallback(() => {
    const threshold = 100; // pixels from bottom
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const nearBottom = scrollHeight - scrollTop - clientHeight < threshold;

    setIsNearBottom(nearBottom);
    scrollStateRef.current = {
      isNearBottom: nearBottom,
      lastChecked: Date.now(),
    };
  }, []);

  useEffect(() => {
    if (!userQuery.data || messages.length === 0) return;

    const currentUserId = userQuery.data.id;
    const latestMessage = messages[messages.length - 1];
    const isMyMessage = latestMessage?.profile_id === currentUserId;

    // Always scroll if it's my own message
    if (isMyMessage) {
      scrollToBottom();
      setIsNearBottom(true);
      setHasUnreadMessages(false);
      return;
    }

    // For others' messages, use the most recent scroll state captured by scroll events
    const shouldAutoScroll = scrollStateRef.current.isNearBottom;

    if (shouldAutoScroll) {
      scrollToBottom();
      setIsNearBottom(true);
      setHasUnreadMessages(false);
    } else {
      setIsNearBottom(false);
      setHasUnreadMessages(true);
    }
  }, [messages, gameQuery?.data, scrollToBottom, userQuery.data]);

  useEffect(() => {
    const handleScroll = () => checkScrollPosition();
    const handleResize = () => {
      checkScrollPosition();
      if (isNearBottom) {
        scrollToBottom();
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial check
    checkScrollPosition();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [checkScrollPosition, isNearBottom, scrollToBottom]);

  if (!userQuery.data) return null;

  const userData = userQuery.data;

  return (
    <>
      <List ref={listRef}>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} user={userData} />
        ))}
        <div ref={endOfMessagesRef} />
      </List>

      {!isNearBottom && (
        <Fab
          variant={hasUnreadMessages ? "extended" : "circular"}
          color={hasUnreadMessages ? "secondary" : "default"}
          onClick={scrollToBottom}
          data-testid="new-messages-button"
          sx={{
            position: "fixed",
            bottom: 100,
            right: 16,
            zIndex: 10,
          }}
        >
          <KeyboardArrowDown />
          {hasUnreadMessages && (
            <Typography variant="body2">{t("buttons.newMessage")}</Typography>
          )}
        </Fab>
      )}
    </>
  );
};
