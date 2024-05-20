import React, { useContext } from "react";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import { Box, Chip, LinearProgress, Typography } from "@mui/material";
import { supabase } from "@/utils/supabase/client";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { playerVoteFunction } from "@/queries/functions/functions.query";

export const ChatVote: React.FC = () => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);

  const me = players?.find((player) => player.user_id === user?.id);
  const numLivingHumans = players
    .filter((player) => player.user_id)
    .filter((player) => !player.is_dead).length;
  const numVotes = players?.filter((player) => player?.vote !== null).length;
  const voteProgress = (100 * numVotes) / numLivingHumans;

  const vote = async (playerId: string) => {
    if (!me) return;
    if (!room?.data?.id) return;
    playerVoteFunction(supabase, {
      roomId: room.data.id,
      playerId: me.id,
      vote: playerId,
    });
  };

  const chipLabel = (player: PlayerData) => {
    const isDead = player.is_dead ? "💀" : "";
    const name = player.name;
    const you = me?.id === player.id ? " (you)" : "";
    const numVotes = players
      ?.filter((other) => other.vote === player.id)
      .map(() => "❌")
      .join("");
    return `${name} ${you} ${isDead} ${numVotes}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        flexDirection: "column",
        p: 1,
        gap: 1,
      }}
    >
      <Typography sx={{ textAlign: "center" }}>
        {me?.vote ? "Waiting for others to vote" : "Vote to eliminate a human"}
      </Typography>
      <LinearProgress variant="determinate" value={voteProgress} />
      {players?.map((player) => (
        <Chip
          key={player.id}
          label={chipLabel(player)}
          color={me?.vote === player.id ? "primary" : "default"}
          onClick={() => vote(player.id)}
          disabled={!!me?.vote || player.is_dead}
        />
      ))}
    </Box>
  );
};
