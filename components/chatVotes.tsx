import React from "react";
import { Box, Button, SxProps, Theme, Typography } from "@mui/material";
import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { VoteResults } from "./voteResult";
import { ProgressTimer } from "./progressTimer";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { usePlayerVoteMutation } from "@/hooks/useFunctionsQuery";
import { useIsLoading } from "@/hooks/useIsLoading";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatVote: React.FC<Props> = ({ sx }) => {
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const profilesQuery = useProfilesQuery();
  const profiles = profilesQuery.data || [];
  const playerVoteMutation = usePlayerVoteMutation();
  const isLoading = useIsLoading();

  if (!profiles) return null;
  if (!gameQuery) return null;
  if (!userQuery.data) return null;

  const didVote = (profile: ProfileData) => profile.vote || profile.vote_blank;

  const me = profiles.find((profile) => profile.id === userQuery.data?.id);
  if (!me) return null;
  const humans = profiles.filter((profile) => !profile.is_bot);
  const otherProfiles = profiles.filter((profile) => profile.id !== me.id);
  const humansDidntVote = humans.filter((profile) => !didVote(profile));
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p) => p.name).join(", ");
  const everyoneVoted = humansDidntVote.length === 0;
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

  const voteOptions = [{ id: "blank", name: "Nobody" }, ...otherProfiles];

  const clueText = () => {
    if (!me.is_bot && !alreadyVoted) return <>Who was the AI? 🤖</>;
    return <>Waiting for {humansDidntVoteString} to vote</>;
  };

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
      {/* results timer */}
      {everyoneVoted && <ProgressTimer duration={5} />}
      {/* clue */}
      {!everyoneVoted && (
        <Typography sx={{ textAlign: "center" }}>{clueText()}</Typography>
      )}
      {/* vote results */}
      {(alreadyVoted || me.is_bot) && <VoteResults />}
      {/* vote buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          flexWrap: "wrap",
          gap: 1,
          pb: 1,
        }}
      >
        {!me.is_bot &&
          !alreadyVoted &&
          voteOptions.map((option) => (
            <Button
              key={option.id}
              variant="contained"
              color={option.id === "blank" ? "primary" : "secondary"}
              sx={{ ml: 1 }}
              onClick={() => vote(option.id)}
              disabled={!canVote(option) || isLoading}
            >
              {option.id === "blank" && "❌ "}
              {option.name}
            </Button>
          ))}
      </Box>
    </Box>
  );
};
