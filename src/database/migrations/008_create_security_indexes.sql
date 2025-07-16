BEGIN;

-- Activity Logs Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON public.activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_role ON public.activity_logs(user_role);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Composite indexes untuk query yang sering digunakan
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_timestamp ON public.activity_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_timestamp ON public.activity_logs(action_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_role_timestamp ON public.activity_logs(user_role, timestamp DESC);

-- Backup Records Indexes
CREATE INDEX IF NOT EXISTS idx_backup_records_created_by ON public.backup_records(created_by);
CREATE INDEX IF NOT EXISTS idx_backup_records_status ON public.backup_records(status);
CREATE INDEX IF NOT EXISTS idx_backup_records_backup_type ON public.backup_records(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_records_started_at ON public.backup_records(started_at);
CREATE INDEX IF NOT EXISTS idx_backup_records_created_at ON public.backup_records(created_at);

-- Roles Indexes
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON public.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_created_at ON public.roles(created_at);

COMMIT;