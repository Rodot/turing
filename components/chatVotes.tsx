import React, { useContext } from "react";
import {
  PlayersContext,
  RoomContext,
  RoomProfilesContext,
  UserContext,
} from "./contextProvider";
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
  const profiles = useContext(RoomProfilesContext);

  const me = players?.find((player) => player.user_id === user?.id);
  const numLivingHumans = players
    .filter((player) => player.user_id)
    .filter((player) => !player.is_dead).length;
  const numVotes = players?.filter((player) => player?.vote !== null).length;
  const voteProgress = (100 * numVotes) / numLivingHumans;

  const gameOver = room?.data?.status === "over";
  const canVote =
    !me?.is_dead && !me?.vote && !gameOver && room?.data?.status === "voting";

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
    const profile = profiles?.find((profile) => profile.id === player.user_id);
    const profileName = profile ? `(${profile?.name})` : "(AI)";
    const showProfileName =
      (player.is_dead || gameOver) && me?.id !== player.id;
    return `${playerName} ${you}${showProfileName ? profileName : ""}`;
  };
  const votesRemaining = numLivingHumans - numVotes;

  const playerStatus = (player: PlayerData) => {
    const numVotes = players
      ?.filter((other) => other.vote === player.id)
      .map(() => "❌")
      .join("");
    const isDead = player.is_dead ? "💀" : "";

    return `${numVotes}${isDead}`;
  };

  const clueText = () => {
    if (room?.data?.status !== "voting") return " ";
    if (votesRemaining <= 0) return " ";
    if (!me?.vote) return <strong>Vote to eliminate a human</strong>;
    return <>Waiting for {votesRemaining} more vote(s)</>;
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
              onDelete={
                !canVote || player.is_dead ? undefined : () => vote(player.id)
              }
              // disabled={}
              sx={{}}
            />
            <Box>{playerStatus(player)}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
