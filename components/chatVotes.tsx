import React, { useContext } from "react";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import {
  Box,
  Chip,
  LinearProgress,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { supabase } from "@/utils/supabase/client";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { playerVoteFunction } from "@/queries/functions/functions.query";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatVote: React.FC<Props> = ({ sx }) => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);

  const me = players?.find((player) => player.user_id === user?.id);
  const numHumans = players.filter((player) => !player.is_bot).length;
  const numVotes = players?.filter((player) => player?.vote !== null).length;
  const playersDidntVote = players?.filter((player) => !player.vote);
  const playersDidntVoteString = playersDidntVote.map((p) => p.name).join(", ");
  const voteProgress = (100 * numVotes) / numHumans;

  const gameOver = room?.data?.status === "over";
  const canVote = (player: PlayerData) => {
    if (me?.is_bot) return false; //
    if (me?.vote) return false; // already voted
    if (player.id === me?.id) return false; // can't vote for self
    if (gameOver) return false; // game is over
    if (room?.data?.status !== "voting") return false; // not voting
    return true;
  };

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
    const playerName = player.name;
    const you = me?.id === player.id ? " (you)" : "";
    return `${playerName} ${you}`;
  };
  const votesRemaining = numHumans - numVotes;

  const playerStatus = (player: PlayerData) => {
    const scoreString = "🧠".repeat(player.score);
    const numVotes = players
      ?.filter((other) => other.vote === player.id)
      .map(() => "❌")
      .join("");

    return ` ${scoreString} ${numVotes}`;
  };

  const clueText = () => {
    if (room?.data?.status !== "voting") return " ";
    if (votesRemaining <= 0) return " ";
    if (me?.is_bot) return "You can't vote as you were 🤖 Possessed";
    if (!me?.vote)
      return (
        <>
          Vote to exorcise the <strong>🤖 Possessed</strong>
        </>
      );
    return <>Waiting for {playersDidntVoteString} to vote</>;
  };

  return (
    <Box sx={sx}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          justifyContent: "center",
          alignContent: "center",
          pb: 1,
        }}
      >
        <LinearProgress
          color="secondary"
          variant="determinate"
          value={voteProgress}
        />
        <Typography sx={{ textAlign: "center" }}>{clueText()}</Typography>
        {players?.map((player) => (
          <Box
            key={player.id}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Chip
              label={chipLabel(player)}
              color={me?.vote === player.id ? "secondary" : "default"}
              onDelete={canVote(player) ? () => vote(player.id) : undefined}
              sx={{}}
            />
            <Box>{playerStatus(player)}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
