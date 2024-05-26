-- rooms
CREATE TABLE public.rooms(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    lang text DEFAULT 'en' ::text,
    status text DEFAULT 'lobby' ::text,
    last_vote integer DEFAULT 0,
    next_vote integer DEFAULT 0,
    next_room_id uuid REFERENCES public.rooms ON DELETE SET NULL
);

ALTER publication supabase_realtime
    ADD TABLE public.rooms;

-- user profiles
CREATE TABLE public.profiles(
    id uuid PRIMARY KEY NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT NOW(),
    room_id uuid REFERENCES public.rooms ON DELETE SET NULL,
    name text
);

CREATE INDEX idx_players_profiles_id ON public.profiles(room_id);

ALTER publication supabase_realtime
    ADD TABLE public.profiles;

-- players
CREATE TABLE public.players(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    room_id uuid NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    vote uuid REFERENCES public.players ON DELETE SET NULL,
    vote_blank boolean DEFAULT FALSE,
    is_bot boolean DEFAULT FALSE,
    score integer DEFAULT 0,
    name text
);

CREATE INDEX idx_players_room_id ON public.players(room_id);

ALTER publication supabase_realtime
    ADD TABLE public.players;

-- messages
CREATE TABLE public.messages(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    room_id uuid NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    player_id uuid REFERENCES public.players ON DELETE SET NULL,
    author text,
    content text
);

CREATE INDEX idx_messages_room_id ON public.messages(room_id);

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
    INSERT INTO public.profiles(id, name, room_id)
        VALUES(NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NULL), COALESCE(NEW.raw_user_meta_data ->> 'room_id', NULL)::uuid);
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

