"use client";

import { fetchUserProfile } from "@/queries/db/profile.query";
import { ProfileData } from "@/supabase/functions/_types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function useUserProfile(userId: string | null) {
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!userId) return;

    fetchUserProfile(supabase, userId).then((newProfile) => {
      console.log("Profile fetched", newProfile?.id);
      setUserProfile(newProfile ?? null);
    });

    // listen for changes to user profile
    const channel = supabase
      .channel("user_profile" + userId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: "id=eq." + userId,
        },
        (payload) => {
          setUserProfile(payload.new as ProfileData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return userProfile;
}
