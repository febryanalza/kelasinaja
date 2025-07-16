BEGIN;

INSERT INTO public.subject (id, title) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Matematika'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Fisika'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Kimia'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Biologi'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Bahasa Indonesia'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Bahasa Inggris'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Sejarah'),
    ('550e8400-e29b-41d4-a716-446655440008', 'Geografi'),
    ('550e8400-e29b-41d4-a716-446655440009', 'Ekonomi'),
    ('550e8400-e29b-41d4-a716-446655440010', 'Sosiologi')
ON CONFLICT (id) DO NOTHING;

COMMIT;