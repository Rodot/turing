import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        setUser(data?.user ?? null);
      }
    };

    checkSession();
  }, []);

  return user;
};
