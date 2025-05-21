import React from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Chip, Container, Paper } from "@mui/material";
import { ChatVote } from "./chatVotes";
import { ButtonGoHome } from "./buttonGoHome";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { useGameQuery } from "@/hooks/useGameQuery";

export const Chat: React.FC = () => {
  const gameQuery = useGameQuery();
  const profilesQuery = useProfilesQuery();
  const profiles = profilesQuery.data || [];

  const isTalking = gameQuery?.data?.status === "talking";
  const isVoting = gameQuery?.data?.status === "voting";

  return (
    <Container
      sx={{
        maxWidth: "720px!important",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          position: "sticky",
          top: 0,
          zIndex: 2,
          p: 0,
          pl: 2,
          borderRadius: 0,
        }}
      >
        <ButtonGoHome />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            overflowX: "auto",
            gap: 1,
          }}
        >
          {profiles
            .sort((a, b) => b.score - a.score)
            .map((profile) => (
              <Box
                key={profile.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Chip
                  size="small"
                  label={profile.name + " " + profile.score + " 🧠"}
                />
              </Box>
            ))}
        </Box>
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
        }}
      >
        {isTalking && <ChatInput />}
        {isVoting && <ChatVote />}
      </Paper>
    </Container>
  );
};
