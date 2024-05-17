-- games
CREATE TABLE public.games(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- groups
CREATE TABLE public.groups(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    current_game_id uuid REFERENCES public.games ON DELETE CASCADE
);

-- chats
CREATE TABLE public.chats(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- user profiles
CREATE TABLE public.profiles(
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    current_group_id uuid REFERENCES public.groups ON DELETE SET NULL,
    name text,
    PRIMARY KEY (id)
);

ALTER publication supabase_realtime
    ADD TABLE public.profiles;

-- players
CREATE TABLE public.players(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    room_id uuid NOT NULL REFERENCES public.groups ON DELETE CASCADE
);

-- messages
CREATE TABLE public.messages(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    chat_id uuid NOT NULL REFERENCES public.chats ON DELETE CASCADE,
    author text,
    user_id text,
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
    INSERT INTO public.profiles(id)
        VALUES(NEW.id);
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

