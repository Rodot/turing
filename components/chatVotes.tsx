import React from "react";
import { Box, Button, SxProps, Theme, Typography } from "@mui/material";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { usePlayerVoteMutation } from "@/hooks/useFunctionsMutation";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";
import { ProfileData } from "@/supabase/functions/_types/Database.type";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatVote: React.FC<Props> = ({ sx }) => {
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const profilesQuery = useProfilesQuery();
  const profiles = profilesQuery.data || [];
  const playerVoteMutation = usePlayerVoteMutation();
  const isAnythingLoading = useIsAnythingLoading();

  const didVote = (profile: ProfileData) => profile.vote || profile.vote_blank;
  const humans = profiles.filter((profile) => !profile.is_bot);
  const humansDidntVote = humans.filter((profile) => !didVote(profile));
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p) => p.name).join(", ");

  if (!profiles) return null;
  if (!gameQuery) return null;
  if (!userQuery.data) return null;

  const me = profiles.find((profile) => profile.id === userQuery.data?.id);
  if (!me) return null;
  const otherProfiles = profiles.filter((profile) => profile.id !== me.id);
  const alreadyVoted = me.vote || me.vote_blank;

  const canVote = (profile: { id: string; name: string }) => {
    if (me.is_bot) return false; //
    if (alreadyVoted) return false; // already voted
    if (profile.id === me.id) return false; // can't vote for self
    if (gameQuery.data?.status !== "voting") return false; // not voting
    return true;
  };

  const vote = async (profileId: string) => {
    if (!me) return;
    if (!gameQuery.data?.id) return;
    try {
      await playerVoteMutation.mutateAsync({
        gameId: gameQuery.data.id,
        profileId: me.id,
        vote: profileId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const voteOptions = [...otherProfiles, { id: "blank", name: "Nobody❌" }];

  if (humansDidntVote.length === 0) {
    return null;
  }

  if (alreadyVoted || me.is_bot) {
    return (
      <Typography align="center">
        <strong>Waiting for {humansDidntVoteString}</strong> to vote
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        ...sx,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        gap: 1,
        p: 1,
      }}
    >
      {/* clue */}
      {!me.is_bot && (
        <Typography sx={{ textAlign: "center" }}>Who was the AI? 🤖</Typography>
      )}
      {/* vote buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {!me.is_bot &&
          voteOptions.map((option) => (
            <Button
              key={option.id}
              variant="contained"
              color={option.id === "blank" ? "primary" : "secondary"}
              onClick={() => vote(option.id)}
              disabled={!canVote(option) || isAnythingLoading}
              size="small"
            >
              {option.name}
            </Button>
          ))}
      </Box>
    </Box>
  );
};
