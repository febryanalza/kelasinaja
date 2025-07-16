BEGIN;

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    user_id uuid,
    badge integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT badges_pkey PRIMARY KEY (id)
);

-- Liked videos (many-to-many: users <-> videos)
CREATE TABLE IF NOT EXISTS public.liked_videos
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    video_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT liked_videos_pkey PRIMARY KEY (id)
);

-- Purchased videos (transaction records)
CREATE TABLE IF NOT EXISTS public.purchased_videos
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    video_id uuid NOT NULL,
    purchase_date timestamp with time zone NOT NULL DEFAULT now(),
    price_paid numeric NOT NULL,
    payment_method text COLLATE pg_catalog."default",
    payment_status text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT purchased_videos_pkey PRIMARY KEY (id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    start_date timestamp with time zone NOT NULL DEFAULT now(),
    end_date timestamp with time zone NOT NULL,
    price_paid numeric NOT NULL,
    is_active boolean DEFAULT true,
    payment_method text COLLATE pg_catalog."default",
    payment_status text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT subscriptions_pkey PRIMARY KEY (id)
);

-- Token transactions (transaction history)
CREATE TABLE IF NOT EXISTS public.token_transactions
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    transaction_type text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    payment_method text COLLATE pg_catalog."default",
    payment_status text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT token_transactions_pkey PRIMARY KEY (id)
);

-- Video ratings
CREATE TABLE IF NOT EXISTS public.video_ratings
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    video_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT video_ratings_pkey PRIMARY KEY (id)
);

-- Video views (analytics)
CREATE TABLE IF NOT EXISTS public.video_views
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    video_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT video_views_pkey PRIMARY KEY (id)
);

-- Wishlists (many-to-many: users <-> videos)
CREATE TABLE IF NOT EXISTS public.wishlists
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    video_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT wishlists_pkey PRIMARY KEY (id)
);

COMMIT;