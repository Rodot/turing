-- keep-alive
CREATE TABLE "keep-alive" (
  id BIGINT generated BY DEFAULT AS IDENTITY,
  name text NULL DEFAULT '':: text,
  random uuid NULL DEFAULT gen_random_uuid (),
  CONSTRAINT "keep-alive_pkey" PRIMARY key (id)
);

-- games
CREATE TABLE public.games(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    lang text DEFAULT 'en' ::text,
    status text DEFAULT 'lobby' ::text,
    players jsonb NOT NULL DEFAULT '[]'::jsonb,
    last_bot_id uuid NULL
);

ALTER publication supabase_realtime
    ADD TABLE public.games;

-- profiles
CREATE TABLE public.profiles(
    id uuid PRIMARY KEY NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT NOW(),
    game_id uuid REFERENCES public.games ON DELETE SET NULL,
    name text
);

CREATE INDEX idx_profiles_game_id ON public.profiles(game_id);

ALTER publication supabase_realtime
    ADD TABLE public.profiles;

-- messages
CREATE TABLE public.messages(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    game_id uuid NOT NULL REFERENCES public.games ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles ON DELETE SET NULL,
    author_name text,
    type text DEFAULT 'user',
    content text
);

CREATE INDEX idx_messages_game_id ON public.messages(game_id);

ALTER publication supabase_realtime
    ADD TABLE public.messages;

-- create a public profile when a user is created, using the same id
CREATE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
BEGIN
    INSERT INTO public.profiles(id, name, game_id)
        VALUES(NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NULL), COALESCE(NEW.raw_user_meta_data ->> 'game_id', NULL)::uuid);
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();