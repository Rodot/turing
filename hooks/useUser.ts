import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

let loadingUser = false;

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  const signUp = async (name: string | null, room_id: string | null) => {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { name, room_id } },
    });
    if (error) throw new Error(error.message);
    if (!data?.user?.id) throw new Error("No user returned from sign up");
    setUser(data.user);
    console.log("Signed up " + data.user.id);
  };

  useEffect(() => {
    const signInOrUp = async () => {
      try {
        if (loadingUser) return;
        loadingUser = true;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          console.log("Signed in " + user.id);
        }
      } finally {
        loadingUser = false;
      }
    };

    signInOrUp();
  }, []);

  return { ...user, signUp };
};
