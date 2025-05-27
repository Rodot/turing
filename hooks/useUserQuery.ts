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
      throw Error("userError:", userError);
    }
    const profile = await fetchUserProfile(supabase, userData.user.id);
    if (profile === undefined) {
      throw new Error(
        "getOrCreateUser: No profile returned from fetchUserProfile",
      );
    }
    return userData.user;
  } catch (error) {
    console.error("getUser:", error);
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
