BEGIN;

-- Activity logs constraints
DO $$ 
BEGIN
    -- Check action_type values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'activity_logs_action_type_check'
    ) THEN
        ALTER TABLE public.activity_logs 
            ADD CONSTRAINT activity_logs_action_type_check 
            CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'PURCHASE', 'UPLOAD', 'ACCESS'));
    END IF;
    
    -- Check user_role values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'activity_logs_user_role_check'
    ) THEN
        ALTER TABLE public.activity_logs 
            ADD CONSTRAINT activity_logs_user_role_check 
            CHECK (user_role IN ('admin', 'teacher', 'student'));
    END IF;
    
    -- Check resource_type values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'activity_logs_resource_type_check'
    ) THEN
        ALTER TABLE public.activity_logs 
            ADD CONSTRAINT activity_logs_resource_type_check 
            CHECK (resource_type IN ('video', 'user', 'transaction', 'backup', 'role', 'class', 'subject', 'system') OR resource_type IS NULL);
    END IF;
END $$;

-- Backup records constraints
DO $$ 
BEGIN
    -- Check backup_type values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'backup_records_backup_type_check'
    ) THEN
        ALTER TABLE public.backup_records 
            ADD CONSTRAINT backup_records_backup_type_check 
            CHECK (backup_type IN ('manual', 'scheduled', 'auto'));
    END IF;
    
    -- Check status values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'backup_records_status_check'
    ) THEN
        ALTER TABLE public.backup_records 
            ADD CONSTRAINT backup_records_status_check 
            CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled'));
    END IF;
    
    -- Check file_size is positive
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'backup_records_file_size_check'
    ) THEN
        ALTER TABLE public.backup_records 
            ADD CONSTRAINT backup_records_file_size_check 
            CHECK (file_size IS NULL OR file_size > 0);
    END IF;
END $$;

COMMIT;