BEGIN;

-- Activity logs foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_user_id_fkey' 
        AND table_name = 'activity_logs'
    ) THEN
        ALTER TABLE public.activity_logs
            ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;
END $$;

-- Backup records foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'backup_records_created_by_fkey' 
        AND table_name = 'backup_records'
    ) THEN
        ALTER TABLE public.backup_records
            ADD CONSTRAINT backup_records_created_by_fkey FOREIGN KEY (created_by)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;