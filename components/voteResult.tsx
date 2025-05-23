import React from "react";
import { Box, Chip, SxProps, Theme, Typography } from "@mui/material";
import { useGameQuery } from "@/hooks/useGameQuery";
import { PlayerData } from "@/supabase/functions/_types/Database.type";

type Props = {
  sx?: SxProps<Theme>;
};

export const VoteResults: React.FC<Props> = ({ sx }) => {
  const gameQuery = useGameQuery();
  const players = gameQuery.data?.players || [];

  const didVote = (player: PlayerData) => player.vote || player.vote_blank;
  const humans = players.filter((player: PlayerData) => !player.is_bot);
  const humansDidntVote = humans.filter(
    (player: PlayerData) => !didVote(player),
  );
  const everyoneVoted = humansDidntVote.length === 0;
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p: PlayerData) => p.name).join(", ");

  return (
    <Box sx={{ ...sx, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {/* Players list */}
      {players.map((player: PlayerData) => (
        <Box
          key={player.id}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          <Chip
            size="small"
            label={player.name + (player.is_bot ? " 🤖" : "")}
            color="secondary"
          />
          {players
            .filter((other: PlayerData) => other.vote === player.id)
            .map((other: PlayerData) => (
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
        {players
          .filter((other: PlayerData) => other.vote_blank)
          .map((other: PlayerData) => (
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
