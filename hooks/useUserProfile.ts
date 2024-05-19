"use client";

import { fetchUserProfile } from "@/queries/db/profile.query";
import { ProfileData } from "@/types/Database.type";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function userUserProfile(userId: string | null) {
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);

  const updateUserProfile = async () => {
    if (!userId?.length) {
      setUserProfile(null);
      return;
    }
    const newProfile = await fetchUserProfile(supabase, userId);
    setUserProfile(newProfile ?? null);
  };

  useEffect(() => {
    updateUserProfile();

    if (!userId?.length) return;

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
          console.log(payload);
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
