BEGIN;

-- Users table (base table for all user-related operations)
CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    email text COLLATE pg_catalog."default" NOT NULL,
    full_name text COLLATE pg_catalog."default",
    avatar_url text COLLATE pg_catalog."default",
    grade text COLLATE pg_catalog."default",
    role text COLLATE pg_catalog."default" NOT NULL DEFAULT 'student'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    badge bigint,
    hash_password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

-- Subject table (independent table)
CREATE TABLE IF NOT EXISTS public.subject
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT subject_pkey PRIMARY KEY (id)
);

-- Videos table (depends on users and subject)
CREATE TABLE IF NOT EXISTS public.videos
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    grade text COLLATE pg_catalog."default" NOT NULL,
    thumbnail text COLLATE pg_catalog."default",
    video_url text COLLATE pg_catalog."default" NOT NULL,
    price numeric DEFAULT 0,
    views integer DEFAULT 0,
    rating numeric DEFAULT 0,
    teacher_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    subject uuid NOT NULL,
    CONSTRAINT videos_pkey PRIMARY KEY (id)
);

-- Tokens table (user wallet)
CREATE TABLE IF NOT EXISTS public.tokens
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    amount integer NOT NULL DEFAULT 0,
    last_updated timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tokens_pkey PRIMARY KEY (id),
    CONSTRAINT tokens_user_id_key UNIQUE (user_id)
);

COMMIT;