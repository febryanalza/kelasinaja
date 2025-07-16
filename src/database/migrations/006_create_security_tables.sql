BEGIN;

-- Activity Logs table untuk audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_name character varying(255) NOT NULL,
    user_email character varying(255) NOT NULL,
    user_role character varying(50) NOT NULL,
    action character varying(255) NOT NULL,
    action_type character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id character varying(255),
    ip_address inet,
    user_agent text COLLATE pg_catalog."default",
    details jsonb,
    timestamp timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT activity_logs_pkey PRIMARY KEY (id)
);

-- Roles table untuk management role dan permissions
CREATE TABLE IF NOT EXISTS public.roles
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying(100) NOT NULL,
    description text COLLATE pg_catalog."default",
    permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_name_key UNIQUE (name)
);

-- Backup Records table untuk tracking backup files
CREATE TABLE IF NOT EXISTS public.backup_records
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    filename character varying(255) NOT NULL,
    original_filename character varying(255),
    file_path character varying(500),
    file_size bigint,
    backup_type character varying(50) DEFAULT 'manual'::character varying,
    status character varying(50) DEFAULT 'in_progress'::character varying,
    description text COLLATE pg_catalog."default",
    created_by uuid,
    error_message text COLLATE pg_catalog."default",
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT backup_records_pkey PRIMARY KEY (id)
);

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES 
('admin', 'Administrator dengan akses penuh ke seluruh sistem', 
 '["manage_users", "manage_videos", "manage_transactions", "manage_system", "view_analytics", "manage_backups", "manage_roles", "view_logs", "manage_subjects"]'::jsonb),
('teacher', 'Pengajar yang dapat mengelola konten pembelajaran dan melihat analytics', 
 '["create_videos", "edit_own_videos", "delete_own_videos", "view_own_analytics", "manage_own_classes", "view_students", "create_subjects"]'::jsonb),
('student', 'Siswa yang dapat mengakses konten pembelajaran dan fitur interaktif', 
 '["view_videos", "purchase_videos", "rate_videos", "view_own_profile", "edit_own_profile", "add_to_wishlist", "view_purchased_videos"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

COMMIT;