import React from "react";
import { Box, Button, SxProps, Theme, Typography } from "@mui/material";
import { useUserQuery } from "@/hooks/useUserQuery";
import { useGameQuery } from "@/hooks/useGameQuery";
import { usePlayerVoteMutation } from "@/hooks/useFunctionsMutation";
import { PlayerData } from "@/supabase/functions/_types/Database.type";
import { getPlayerFromGame } from "@/supabase/functions/_shared/utils";
import { useTranslation } from "react-i18next";

type Props = {
  sx?: SxProps<Theme>;
};

export const ChatVote: React.FC<Props> = ({ sx }) => {
  const { t } = useTranslation();
  const userQuery = useUserQuery();
  const gameQuery = useGameQuery();
  const playerVoteMutation = usePlayerVoteMutation();

  if (!gameQuery.data) return null;
  if (!userQuery.data) return null;

  const players = gameQuery.data.players || [];
  const didVote = (player: PlayerData) => player.vote || player.vote_blank;
  const humans = players.filter((player) => !player.is_bot);
  const humansDidntVote = humans.filter((player) => !didVote(player));
  const humansDidntVoteString =
    humansDidntVote.length > 2
      ? "others"
      : humansDidntVote.map((p) => p.name).join(", ");

  const me = getPlayerFromGame(gameQuery.data, userQuery.data.id);
  if (!me) return null;
  const otherPlayers = players.filter((player) => player.id !== me.id);
  const alreadyVoted = me.vote || me.vote_blank;

  const canVote = (player: { id: string; name: string }) => {
    if (me.is_bot) return false;
    if (alreadyVoted) return false;
    if (player.id === me.id) return false;
    if (gameQuery.data?.status !== "voting") return false;
    return true;
  };

  const vote = async (playerId: string) => {
    if (!me) return;
    if (!gameQuery.data?.id) return;
    try {
      await playerVoteMutation.mutateAsync({
        gameId: gameQuery.data.id,
        profileId: me.id,
        vote: playerId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const voteOptions = [
    ...otherPlayers,
    { id: "blank", name: t("voting.nobody") },
  ];

  if (humansDidntVote.length === 0) {
    return null;
  }

  if (alreadyVoted || me.is_bot) {
    return (
      <Typography align="center">
        <strong>
          {t("voting.waitingForPlayers", { players: humansDidntVoteString })}
        </strong>
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
        <Typography sx={{ textAlign: "center" }}>
          {t("voting.whoWasAi")}
        </Typography>
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
              disabled={!canVote(option) || playerVoteMutation.isPending}
              size="small"
            >
              {option.name}
            </Button>
          ))}
      </Box>
    </Box>
  );
};
