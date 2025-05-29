import React from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { useTranslation } from "react-i18next";

export const ButtonResumeGame: React.FC = () => {
  const { t } = useTranslation();
  const profileQuery = useProfileQuery();
  const router = useRouter();

  const resumeGame = async () => {
    router.push(`/?game=${profileQuery.data?.game_id}`);
  };

  return (
    <Button color="secondary" variant="contained" onClick={resumeGame}>
      🏁&nbsp;{t("buttons.resume")}
    </Button>
  );
};
