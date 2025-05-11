import React, { useContext, useState } from "react";
import { PlayersContext } from "./contextProvider";
import { Box, Button, SxProps, Theme, Typography } from "@mui/material";
import { supabase } from "@/utils/supabase/client";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { playerVoteFunction } from "@/queries/functions/functions.query";
import { VoteResults } from "./voteResult";
import { ProgressTimer } from "./progressTimer";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useRoomQuery } from "@/hooks/useRoomQuery";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatVote: React.FC<Props> = ({ sx }) => {
  const userQuery = useUserQuery();
  const roomQuery = useRoomQuery();
  const players = useContext(PlayersContext);
  const [loading, setLoading] = useState(false);

  if (!players) return null;
  if (!roomQuery) return null;
  if (!userQuery.data) return null;

  const didVote = (player: PlayerData) => player.vote || player.vote_blank;

  const me = players.find((player) => player.user_id === userQuery.data?.id);
  if (!me) return null;
  const humans = players.filter((player) => !player.is_bot);
  const otherPlayers = players.filter((player) => player.id !== me.id);
  const humansDidntVote = humans.filter((player) => !didVote(player));
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p) => p.name).join(", ");
  const everyoneVoted = humansDidntVote.length === 0;
  const alreadyVoted = me.vote || me.vote_blank;

  const canVote = (player: { id: string; name: string }) => {
    if (me.is_bot) return false; //
    if (alreadyVoted) return false; // already voted
    if (player.id === me.id) return false; // can't vote for self
    if (roomQuery.data?.status !== "voting") return false; // not voting
    return true;
  };

  const vote = async (playerId: string) => {
    if (!me) return;
    if (!roomQuery.data?.id) return;
    try {
      setLoading(true);
      await playerVoteFunction(supabase, {
        roomId: roomQuery.data.id,
        playerId: me.id,
        vote: playerId,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const voteOptions = [{ id: "blank", name: "Nobody" }, ...otherPlayers];

  const clueText = () => {
    if (!me.is_bot && !alreadyVoted) return <>Who was 🤖 the AI ?</>;
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
              disabled={!canVote(option) || loading}
            >
              {option.id === "blank" && "❌ "}
              {option.name}
            </Button>
          ))}
      </Box>
    </Box>
  );
};
