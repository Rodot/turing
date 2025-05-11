"use client";

import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

// Get or create user function
const getOrCreateUser = async (): Promise<User | undefined> => {
  // Try to get existing user
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If user exists, return it
  if (userData?.user) {
    console.log("Found existing user: " + userData.user.id);
    return userData.user;
  }

  if (userError) {
    console.error("Error getting user:", userError);
  }

  // If no user exists, sign up anonymously
  const { data: signupData, error: signupError } =
    await supabase.auth.signInAnonymously();

  if (signupError) {
    console.error("Error signing up:", signupError);
    return undefined;
  }

  if (!signupData?.user) {
    console.error("No user returned from sign up");
    return undefined;
  }

  console.log("Signed up new user: " + signupData.user.id);
  return signupData.user;
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getOrCreateUser,
  });
};
