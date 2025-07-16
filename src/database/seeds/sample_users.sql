BEGIN;

-- Sample admin user (password: admin123)
INSERT INTO public.users (id, email, full_name, role, hash_password, grade) VALUES 
    ('550e8400-e29b-41d4-a716-446655440100', 'admin@kelasinaja.com', 'Administrator', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrBsOFgO8NLGSKu', null)
ON CONFLICT (email) DO NOTHING;

-- Sample teacher user (password: teacher123)
INSERT INTO public.users (id, email, full_name, role, hash_password, grade) VALUES 
    ('550e8400-e29b-41d4-a716-446655440101', 'teacher@kelasinaja.com', 'Budi Santoso', 'teacher', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrBsOFgO8NLGSKu', null)
ON CONFLICT (email) DO NOTHING;

-- Sample student user (password: student123)
INSERT INTO public.users (id, email, full_name, role, hash_password, grade) VALUES 
    ('550e8400-e29b-41d4-a716-446655440102', 'student@kelasinaja.com', 'Siti Nurhaliza', 'student', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrBsOFgO8NLGSKu', '12')
ON CONFLICT (email) DO NOTHING;

-- Create initial token records for users
INSERT INTO public.tokens (user_id, amount) VALUES 
    ('550e8400-e29b-41d4-a716-446655440100', 0),
    ('550e8400-e29b-41d4-a716-446655440101', 0),
    ('550e8400-e29b-41d4-a716-446655440102', 100)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;