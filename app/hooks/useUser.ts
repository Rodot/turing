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
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          console.log("Signed in " + session.user.id);
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
