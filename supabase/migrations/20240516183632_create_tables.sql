-- rooms
CREATE TABLE public.rooms(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status text DEFAULT 'lobby' ::text,
    next_player_id uuid,
    next_vote integer
);

ALTER publication supabase_realtime
    ADD TABLE public.rooms;

-- user profiles
CREATE TABLE public.profiles(
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    room_id uuid REFERENCES public.rooms ON DELETE SET NULL,
    name text,
    PRIMARY KEY (id)
);

ALTER publication supabase_realtime
    ADD TABLE public.profiles;

-- players
CREATE TABLE public.players(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    room_id uuid NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    vote uuid REFERENCES public.players ON DELETE SET NULL,
    is_dead boolean DEFAULT FALSE,
    name text
);

ALTER publication supabase_realtime
    ADD TABLE public.players;

-- messages
CREATE TABLE public.messages(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    room_id uuid NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL,
    player_id uuid REFERENCES public.players ON DELETE SET NULL,
    author text,
    content text
);

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

