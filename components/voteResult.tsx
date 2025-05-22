import React from "react";
import { Box, Chip, SxProps, Theme, Typography } from "@mui/material";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";
import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { ProgressTimer } from "./progressTimer";

type Props = {
  sx?: SxProps<Theme>;
};

export const VoteResults: React.FC<Props> = ({ sx }) => {
  const didVote = (profile: ProfileData) => profile.vote || profile.vote_blank;
  const profilesQuery = useProfilesQuery();
  const profiles = profilesQuery.data || [];
  const humans = profiles.filter((profile) => !profile.is_bot);
  const humansDidntVote = humans.filter((profile) => !didVote(profile));
  const everyoneVoted = humansDidntVote.length === 0;
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p) => p.name).join(", ");

  return (
    <Box sx={{ ...sx, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {/* Profiles list */}
      {profiles.map((profile) => (
        <Box
          key={profile.id}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Chip
            size="small"
            label={profile.name + (profile.is_bot ? " 🤖" : "")}
            color="secondary"
          />
          {profiles
            .filter((other) => other.vote === profile.id)
            .map((other) => (
              <Chip size="small" key={other.id} label={"👈 " + other.name} />
            ))}
        </Box>
      ))}

      {/* Nobody list */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Chip size="small" label={"Nobody ❌"} color="primary" />
        {profiles
          .filter((other) => other.vote_blank)
          .map((other) => (
            <Chip size="small" key={other.id} label={"👈 " + other.name} />
          ))}
      </Box>

      {/* reminder line */}
      {!everyoneVoted && (
        <Typography align="center">
          Waiting for {humansDidntVoteString} to vote
        </Typography>
      )}
    </Box>
  );
};
