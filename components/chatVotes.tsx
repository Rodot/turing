import React, { useContext, useState } from "react";
import { PlayersContext, RoomContext, UserContext } from "./contextProvider";
import {
  Box,
  Button,
  LinearProgress,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { supabase } from "@/utils/supabase/client";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { playerVoteFunction } from "@/queries/functions/functions.query";
import { Spinner } from "./spinner";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatVote: React.FC<Props> = ({ sx }) => {
  const user = useContext(UserContext);
  const room = useContext(RoomContext);
  const players = useContext(PlayersContext);
  const [loading, setLoading] = useState(false);
  if (!players) return null;
  if (!room) return null;
  if (!user) return null;

  const didVote = (player: PlayerData) => player.vote || player.vote_blank;

  const me = players.find((player) => player.user_id === user?.id);
  if (!me) return null;
  const humans = players.filter((player) => !player.is_bot);
  const otherPlayers = players.filter((player) => player.id !== me.id);
  const humansDidntVote = humans.filter((player) => !didVote(player));
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p) => p.name).join(", ");

  const alreadyVoted = me.vote || me.vote_blank;

  console.log("is_bot", me.is_bot);
  console.log("me.vote", me.vote, me.vote_blank);

  const canVote = (player: { id: string; name: string }) => {
    if (me.is_bot) return false; //
    if (alreadyVoted) return false; // already voted
    if (player.id === me.id) return false; // can't vote for self
    if (room.data?.status !== "voting") return false; // not voting
    return true;
  };

  const vote = async (playerId: string) => {
    if (!me) return;
    if (!room.data?.id) return;
    try {
      setLoading(true);
      await playerVoteFunction(supabase, {
        roomId: room.data.id,
        playerId: me.id,
        vote: playerId,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const voteOptions = [...otherPlayers, { id: "blank", name: "Nobody" }];

  const clueText = () => {
    if (!me.is_bot && !alreadyVoted) return <>Who was 🤖 possessed ?</>;
    return <>Waiting for {humansDidntVoteString} to vote</>;
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
        <LinearProgress color="secondary" />
        <Typography sx={{ textAlign: "center" }}>{clueText()}</Typography>
        {!me.is_bot &&
          !alreadyVoted &&
          voteOptions.map((option) => (
            <Box
              key={option.id}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                flexDirection: "row",
              }}
            >
              <Button
                variant="contained"
                color={option.id === "blank" ? "primary" : "secondary"}
                sx={{ ml: 1 }}
                onClick={() => vote(option.id)}
                disabled={!canVote(option) || loading}
              >
                {option.id === "blank" && "❌ "}
                {option.name}
                {loading && <Spinner />}
              </Button>
            </Box>
          ))}
      </Box>
    </Box>
  );
};
