import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

var loading = false;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const signInOrUp = async () => {
      if (loading) return;
      loading = true;
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
      loading = false;
    };

    signInOrUp();
  });
  return user;
};
