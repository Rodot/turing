"use client";

import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

const getOrCreateUser = async (): Promise<User | undefined> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If user exists, return it
  if (userData?.user) {
    return userData.user;
  }

  if (userError) {
    console.error("Error getting user:", userError);
  }

  // If no user exists, sign up anonymously
  const { data: signupData, error: signupError } =
    await supabase.auth.signInAnonymously();

  if (signupError) {
    throw new Error("Error signing up: " + signupError.message);
  }

  if (!signupData?.user) {
    throw new Error("No user returned from sign up");
  }

  return signupData.user;
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getOrCreateUser,
  });
};
