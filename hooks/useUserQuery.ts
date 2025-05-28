"use client";

import { fetchUserProfile } from "@/queries/db/profile.query";
import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

const getOrCreateUser = async (): Promise<User> => {
  // If user exists, return it
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      // Don't log "Auth session missing" as it's expected behavior during initialization
      if (!userError.message.includes("Auth session missing")) {
        console.error("getUser: unexpected error:", userError.message);
      }
      throw new Error(`userError: ${userError.message}`);
    }
    const profile = await fetchUserProfile(supabase, userData.user.id);
    if (profile === undefined) {
      throw new Error(
        "getOrCreateUser: No profile returned from fetchUserProfile",
      );
    }
    return userData.user;
  } catch (error) {
    // Only log unexpected errors, not the expected "Auth session missing" flow
    if (
      error instanceof Error &&
      !error.message.includes("Auth session missing")
    ) {
      console.error("getUser:", error);
    }
  }

  // If no user exists, sign up anonymously
  try {
    const { data: signupData, error: signupError } =
      await supabase.auth.signInAnonymously();
    if (signupError) {
      throw new Error("signupError: " + signupError.message);
    }
    if (!signupData?.user) {
      throw new Error("No user returned from sign up");
    }
    return signupData.user;
  } catch (error) {
    console.error("signInAnonymously:", error);
  }
  throw new Error("getOrCreateUser: Failed to get or create user");
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getOrCreateUser,
  });
};
