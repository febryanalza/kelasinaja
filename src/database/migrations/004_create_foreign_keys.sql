BEGIN;

-- Badges foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'badges_user_id_fkey' 
        AND table_name = 'badges'
    ) THEN
        ALTER TABLE public.badges
            ADD CONSTRAINT badges_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Liked videos foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'liked_videos_user_id_fkey' 
        AND table_name = 'liked_videos'
    ) THEN
        ALTER TABLE public.liked_videos
            ADD CONSTRAINT liked_videos_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'liked_videos_video_id_fkey' 
        AND table_name = 'liked_videos'
    ) THEN
        ALTER TABLE public.liked_videos
            ADD CONSTRAINT liked_videos_video_id_fkey FOREIGN KEY (video_id)
            REFERENCES public.videos (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Purchased videos foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'purchased_videos_user_id_fkey' 
        AND table_name = 'purchased_videos'
    ) THEN
        ALTER TABLE public.purchased_videos
            ADD CONSTRAINT purchased_videos_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'purchased_videos_video_id_fkey' 
        AND table_name = 'purchased_videos'
    ) THEN
        ALTER TABLE public.purchased_videos
            ADD CONSTRAINT purchased_videos_video_id_fkey FOREIGN KEY (video_id)
            REFERENCES public.videos (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Subscriptions foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_user_id_fkey' 
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE public.subscriptions
            ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Token transactions foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'token_transactions_user_id_fkey' 
        AND table_name = 'token_transactions'
    ) THEN
        ALTER TABLE public.token_transactions
            ADD CONSTRAINT token_transactions_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Tokens foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tokens_user_id_fkey' 
        AND table_name = 'tokens'
    ) THEN
        ALTER TABLE public.tokens
            ADD CONSTRAINT tokens_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Video ratings foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'video_ratings_user_id_fkey' 
        AND table_name = 'video_ratings'
    ) THEN
        ALTER TABLE public.video_ratings
            ADD CONSTRAINT video_ratings_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'video_ratings_video_id_fkey' 
        AND table_name = 'video_ratings'
    ) THEN
        ALTER TABLE public.video_ratings
            ADD CONSTRAINT video_ratings_video_id_fkey FOREIGN KEY (video_id)
            REFERENCES public.videos (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Video views foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'video_views_video_id_fkey' 
        AND table_name = 'video_views'
    ) THEN
        ALTER TABLE public.video_views
            ADD CONSTRAINT video_views_video_id_fkey FOREIGN KEY (video_id)
            REFERENCES public.videos (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Videos foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'videos_subject_id_fkey' 
        AND table_name = 'videos'
    ) THEN
        ALTER TABLE public.videos
            ADD CONSTRAINT videos_subject_id_fkey FOREIGN KEY (subject)
            REFERENCES public.subject (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'videos_teacher_id_fkey' 
        AND table_name = 'videos'
    ) THEN
        ALTER TABLE public.videos
            ADD CONSTRAINT videos_teacher_id_fkey FOREIGN KEY (teacher_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Wishlists foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'wishlists_user_id_fkey' 
        AND table_name = 'wishlists'
    ) THEN
        ALTER TABLE public.wishlists
            ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'wishlists_video_id_fkey' 
        AND table_name = 'wishlists'
    ) THEN
        ALTER TABLE public.wishlists
            ADD CONSTRAINT wishlists_video_id_fkey FOREIGN KEY (video_id)
            REFERENCES public.videos (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;