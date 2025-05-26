"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import { ButtonCreateGame } from "./buttonCreateGame";
import { Send } from "@mui/icons-material";
import { ButtonJoinGame } from "./buttonJoinGame";
import { ButtonResumeGame } from "./buttonResumeGame";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useProfileNameMutation } from "@/hooks/useProfileMutation";
import { ButtonEndGame } from "./buttonEndGame";
import { useGameIdFromUrl } from "@/hooks/useGameIdFromUrl";
import { useIsAnythingLoading } from "@/hooks/useIsAnythingLoading";
import { useTranslation } from "react-i18next";

export const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const profileQuery = useProfileQuery();
  const profileNameMutation = useProfileNameMutation();
  const [name, setName] = useState("");
  const isNameSet = (profileQuery?.data?.name?.length ?? 0) > 1;
  const urlGameId = useGameIdFromUrl();
  const isAnythingLoading = useIsAnythingLoading();

  const profileGameId = profileQuery.data?.game_id ?? undefined;

  const isResumeGameVisible = !!profileGameId && !urlGameId;
  const isLeaveGameVisible = !!profileGameId && !urlGameId;
  const isJoinGameVisible = !!urlGameId;
  const isCreateGameVisible = !profileGameId && !urlGameId;

  useEffect(() => {
    if (profileQuery.data?.name) {
      setName(profileQuery.data.name);
    }
  }, [profileQuery.data]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting name", name);
    if (name.length >= 3) {
      profileNameMutation.mutate(name);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box sx={{ bgcolor: "primary.main", width: "100%", py: 2 }}>
        <Typography
          sx={{ fontWeight: "900", color: "white" }}
          variant="h4"
          align="center"
        >
          The Turing <strong>Trial</strong>
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography align="center" sx={{ fontWeight: 900 }}>
          {t("game.subtitle")}
        </Typography>
        <Typography align="center" sx={{ fontStyle: "italic" }}>
          {t("game.description")}
        </Typography>
      </Box>

      <Box sx={{ alignSelf: "center" }}>
        <Typography>
          <strong>{t("game.steps.warmup.title")}</strong>{" "}
          {t("game.steps.warmup.description")}
        </Typography>
        <Typography>
          <strong>{t("game.steps.hunt.title")}</strong>{" "}
          {t("game.steps.hunt.description")}
        </Typography>
        <Typography>
          <strong>{t("game.steps.vote.title")}</strong>{" "}
          {t("game.steps.vote.description")}
        </Typography>
        <Typography>
          <strong>{t("game.steps.repeat.title")}</strong>{" "}
          {t("game.steps.repeat.description")}
        </Typography>
      </Box>

      <Box sx={{ my: 2 }} />

      <Box sx={{ alignSelf: "center" }}>
        <Typography>{t("game.scoring.humansVoteAi")}</Typography>
        <Typography>{t("game.scoring.aiAvoidsMajority")}</Typography>
        <Typography>{t("game.scoring.humansGetVotes")}</Typography>
      </Box>

      <Box sx={{ my: 2 }} />

      <Typography fontWeight={900} align="center">
        {t("game.scoring.winCondition")}
      </Typography>

      <Box sx={{ my: 2 }} />

      {!isAnythingLoading && !isNameSet && (
        <form onSubmit={onSubmit} style={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              p: 1,
            }}
          >
            <TextField
              label={t("forms.yourName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mr: 1 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              aria-label="Submit"
              disabled={
                profileQuery.isLoading ||
                profileNameMutation.isPending ||
                name.length < 3
              }
            >
              <Send />
            </Button>
          </Box>
        </form>
      )}
      {!isAnythingLoading && isNameSet && (
        <>
          {isResumeGameVisible && <ButtonResumeGame />}
          {isLeaveGameVisible && <ButtonEndGame />}
          {isJoinGameVisible && <ButtonJoinGame />}
          {isCreateGameVisible && <ButtonCreateGame />}
        </>
      )}

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Made with ❤️ by Aurelien from{" "}
          <Link
            href="https://betalab.fr"
            target="_blank"
            rel="noopener"
            color="secondary.main"
          >
            BetaLab
          </Link>
          .
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please give me feedback at{" "}
          <Link
            href="mailto:turing@betalab.fr?subject=Feedback turing.betalab.fr"
            color="secondary.main"
          >
            turing@betalab.fr
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};
