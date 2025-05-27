import React from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Container, Paper, Typography } from "@mui/material";
import { ChatVote } from "./chatVotes";
import { ButtonGoHome } from "./buttonGoHome";
import { ButtonStartVote } from "./buttonStartVote";
import { WarmupProgressBar } from "./warmupProgressBar";
import { PlayerList } from "./playerList";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useTranslation } from "react-i18next";

export const Chat: React.FC = () => {
  const { t } = useTranslation();
  const gameQuery = useGameQuery();
  const players = gameQuery.data?.players || [];
  const gameStatus = gameQuery?.data?.status;

  const isTalkingPhase =
    gameStatus === "talking_warmup" || gameStatus === "talking_hunt";
  const isVotingPhase = gameStatus === "voting";
  const isHuntingPhase = gameStatus === "talking_hunt";

  const getStatusText = () => {
    switch (gameStatus) {
      case "talking_warmup":
        return t("status.warmingUp");
      case "talking_hunt":
        return t("status.findTheAi");
      case "voting":
        return t("status.voteNow");
      case "over":
        return t("status.gameOver");
      default:
        return t("status.inProgress");
    }
  };

  return (
    <Container
      sx={{
        maxWidth: "720px",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 2,
          p: 0,
          borderRadius: 0,
        }}
      >
        {/* back and vote line */}
        <Paper
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
            borderRadius: 0,
            backgroundColor: isHuntingPhase ? "secondary.main" : "primary.main",
          }}
        >
          <ButtonGoHome />

          <Typography
            sx={{
              color: isHuntingPhase ? "primary.main" : "primary.contrastText",
              fontWeight: 900,
            }}
          >
            {getStatusText()}
          </Typography>

          {isHuntingPhase && <ButtonStartVote />}
        </Paper>

        <WarmupProgressBar />
      </Paper>

      <Box
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
          flexGrow: 1,
        }}
      >
        <ChatHistory />
      </Box>

      <Paper
        elevation={8}
        sx={{
          borderRadius: 0,
          zIndex: 2,
          position: "sticky",
          bottom: 0,
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* players line */}
        <Box
          sx={{
            p: 1,
            width: "100%",
            borderRadius: 0,
          }}
        >
          <PlayerList players={players} />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            p: 1,
            pt: 0,
          }}
        >
          {isTalkingPhase && <ChatInput />}
          {isVotingPhase && <ChatVote />}
        </Box>
      </Paper>
    </Container>
  );
};
