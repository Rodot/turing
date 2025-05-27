import React from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Chip, Container, Paper, Typography } from "@mui/material";
import { ChatVote } from "./chatVotes";
import { ButtonGoHome } from "./buttonGoHome";
import { ButtonStartVote } from "./buttonStartVote";
import { WarmupProgressBar } from "./warmupProgressBar";
import { useGameQuery } from "@/hooks/useGameQuery";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { motion } from "framer-motion";
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
            backgroundColor: "primary.main",
          }}
        >
          <ButtonGoHome />

          <Typography sx={{ color: "primary.contrastText" }}>
            {getStatusText()}
          </Typography>

          {isHuntingPhase && <ButtonStartVote />}
        </Paper>

        <WarmupProgressBar />

        {/* players line */}
        <Paper
          sx={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            overflowX: "auto",
            gap: 1,
            p: 1,
            width: "100%",
            borderRadius: 0,
          }}
        >
          {players
            .sort((a: PlayerData, b: PlayerData) => b.score - a.score)
            .map((player: PlayerData) => (
              <motion.div
                key={player.id}
                layoutId={player.id}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <motion.div
                  key={player.score}
                  initial={{ scale: player.score > 0 ? 1.5 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.0 }}
                >
                  <Chip
                    size="small"
                    label={
                      player.score === 0
                        ? player.name
                        : player.name + " " + player.score + " 🧠"
                    }
                  />
                </motion.div>
              </motion.div>
            ))}
        </Paper>
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
          minHeight: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 1,
        }}
      >
        {isTalkingPhase && <ChatInput />}
        {isVotingPhase && <ChatVote />}
      </Paper>
    </Container>
  );
};
