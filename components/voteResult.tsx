import React, { useContext } from "react";
import { PlayersContext } from "./contextProvider";
import { Box, Chip, SxProps, Theme } from "@mui/material";

type Props = {
  sx?: SxProps<Theme>;
};

export const VoteResults: React.FC<Props> = ({ sx }) => {
  const players = useContext(PlayersContext);
  const noBots =
    (players.filter((player) => !player.is_bot)?.length ?? 0) === 0;

  return (
    <Box sx={{ ...sx, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Chip label={"❌ Nobody"} color="primary" />
        {noBots && <Chip label="🤖" color="primary" />}
        {players
          .filter((other) => other.vote_blank)
          .map((other) => (
            <Chip key={other.id} label={other.name} />
          ))}
      </Box>
      {players.map((player) => (
        <Box
          key={player.id}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Chip label={player.name} color="secondary" />
          {player.is_bot && <Chip label="🤖" color="primary" />}
          {players
            .filter((other) => other.vote === player.id)
            .map((other) => (
              <Chip key={other.id} label={other.name} />
            ))}
        </Box>
      ))}
    </Box>
  );
};
