BEGIN;

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS tokens_user_id_key ON public.tokens(user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS videos_teacher_id_idx ON public.videos(teacher_id);
CREATE INDEX IF NOT EXISTS videos_subject_idx ON public.videos(subject);
CREATE INDEX IF NOT EXISTS videos_grade_idx ON public.videos(grade);
CREATE INDEX IF NOT EXISTS liked_videos_user_id_idx ON public.liked_videos(user_id);
CREATE INDEX IF NOT EXISTS liked_videos_video_id_idx ON public.liked_videos(video_id);
CREATE INDEX IF NOT EXISTS purchased_videos_user_id_idx ON public.purchased_videos(user_id);
CREATE INDEX IF NOT EXISTS purchased_videos_video_id_idx ON public.purchased_videos(video_id);
CREATE INDEX IF NOT EXISTS wishlists_user_id_idx ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS wishlists_video_id_idx ON public.wishlists(video_id);
CREATE INDEX IF NOT EXISTS video_views_video_id_idx ON public.video_views(video_id);
CREATE INDEX IF NOT EXISTS video_views_user_id_idx ON public.video_views(user_id);
CREATE INDEX IF NOT EXISTS video_ratings_video_id_idx ON public.video_ratings(video_id);
CREATE INDEX IF NOT EXISTS video_ratings_user_id_idx ON public.video_ratings(user_id);

COMMIT;