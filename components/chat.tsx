import React from "react";
import { ChatHistory } from "./chatHistory";
import { ChatInput } from "./chatInput";
import { Box, Chip, Container, Paper, Typography } from "@mui/material";
import { ChatVote } from "./chatVotes";
import { ButtonGoHome } from "./buttonGoHome";
import { ButtonStartVote } from "./buttonStartVote";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { VoteResults } from "./voteResult";
import { useUserQuery } from "@/hooks/useUserQuery";

export const Chat: React.FC = () => {
  const gameQuery = useGameQuery();
  const profilesQuery = useProfilesQuery();
  const profiles = profilesQuery.data || [];
  const userQuery = useUserQuery();

  const player = profiles.find((profile) => profile.id === userQuery.data?.id);

  const isTalkingPhase = gameQuery?.data?.status === "talking";
  const isVotingPhase = gameQuery?.data?.status === "voting";

  const playerVoted = player?.vote || player?.vote_blank;
  const isVoteResultsVisible = isVotingPhase && (player?.is_bot || playerVoted);

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

          {isTalkingPhase && (
            <>
              <Typography sx={{ color: "primary.contrastText" }}>
                Know who is the AI?
              </Typography>
              <ButtonStartVote />
            </>
          )}
        </Paper>

        {/* profiles line */}
        {!isVoteResultsVisible && (
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
          </Paper>
        )}

        {/* vote results line */}
        {isVoteResultsVisible && (
          <Box sx={{ p: 1 }}>
            <VoteResults />
          </Box>
        )}
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
        {isTalkingPhase && <ChatInput />}
        {isVotingPhase && <ChatVote />}
      </Paper>
    </Container>
  );
};
