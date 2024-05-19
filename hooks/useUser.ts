import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

var loadingUser = false;

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

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
        } else {
          const { data, error } = await supabase.auth.signInAnonymously();
          setUser(data?.user ?? null);
          console.log("Signed up " + data?.user?.id);
        }
      } finally {
        loadingUser = false;
      }
    };

    signInOrUp();
  }, []);

  return user;
};
