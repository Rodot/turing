import React from "react";
import { Box, Chip, SxProps, Theme } from "@mui/material";
import { useProfilesQuery } from "@/hooks/useProfilesQuery";

type Props = {
  sx?: SxProps<Theme>;
};

export const VoteResults: React.FC<Props> = ({ sx }) => {
  const profilesQuery = useProfilesQuery();
  const profiles = profilesQuery.data || [];
  const noBots =
    (profiles.filter((profile) => !profile.is_bot)?.length ?? 0) === 0;

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
        {profiles
          .filter((other) => other.vote_blank)
          .map((other) => (
            <Chip key={other.id} label={other.name} />
          ))}
      </Box>
      {profiles.map((profile) => (
        <Box
          key={profile.id}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Chip label={profile.name} color="secondary" />
          {profile.is_bot && <Chip label="🤖" color="primary" />}
          {profiles
            .filter((other) => other.vote === profile.id)
            .map((other) => (
              <Chip key={other.id} label={other.name} />
            ))}
        </Box>
      ))}
    </Box>
  );
};
