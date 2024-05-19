-- rooms
CREATE TABLE public.rooms(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    state text DEFAULT 'lobby' ::text
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

-- messages
CREATE TABLE public.messages(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    room_id uuid NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
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

