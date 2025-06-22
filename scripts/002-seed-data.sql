-- Seed data for QR Attendance System
-- Institute of Technology of Cambodia - AMS Department

-- Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, employee_id, department) 
VALUES (
    'admin@ams.edu', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3QJgusgHPK', 
    'System Administrator', 
    'teacher', 
    'ADMIN001', 
    'Administration'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo teacher (password: teacher123)
INSERT INTO users (email, password_hash, name, role, employee_id, department) 
VALUES (
    'lin.mongkolsery@ams.edu', 
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Dr. LIN Mongkolsery', 
    'teacher', 
    'EMP001', 
    'Computer Science'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo student (password: student123)
INSERT INTO users (email, password_hash, name, role, student_id, program, year_level) 
VALUES (
    'e20211125@ams.edu', 
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'AN HENGHENG', 
    'student', 
    'e20211125', 
    'Computer Science', 
    3
) ON CONFLICT (email) DO NOTHING;

-- Insert additional demo students
INSERT INTO users (email, password_hash, name, role, student_id, program, year_level) 
VALUES 
    ('e20211126@ams.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CHAN SOPHEA', 'student', 'e20211126', 'Computer Science', 3),
    ('e20211127@ams.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LIM DARA', 'student', 'e20211127', 'Computer Science', 3),
    ('e20211128@ams.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PICH SOVANNAK', 'student', 'e20211128', 'Computer Science', 3),
    ('e20211129@ams.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KONG PISACH', 'student', 'e20211129', 'Computer Science', 3)
ON CONFLICT (email) DO NOTHING;

-- Insert demo courses with updated time slots
INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
SELECT 
    'Software Engineering', 
    'CS301', 
    u.id, 
    'Room 203', 
    '09:00-11:00', 
    'Monday,Wednesday,Friday', 
    15
FROM users u 
WHERE u.email = 'lin.mongkolsery@ams.edu'
ON CONFLICT (code, teacher_id) DO NOTHING;

INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
SELECT 
    'Database Systems', 
    'CS302', 
    u.id, 
    'Room 204', 
    '13:00-15:00', 
    'Tuesday,Thursday', 
    10
FROM users u 
WHERE u.email = 'lin.mongkolsery@ams.edu'
ON CONFLICT (code, teacher_id) DO NOTHING;

INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
SELECT 
    'Web Development', 
    'CS303', 
    u.id, 
    'Room 205', 
    '15:00-17:00', 
    'Monday,Wednesday,Friday', 
    20
FROM users u 
WHERE u.email = 'lin.mongkolsery@ams.edu'
ON CONFLICT (code, teacher_id) DO NOTHING;

INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
SELECT 
    'Data Structures', 
    'CS304', 
    u.id, 
    'Room 206', 
    '07:00-09:00', 
    'Tuesday,Thursday', 
    15
FROM users u 
WHERE u.email = 'lin.mongkolsery@ams.edu'
ON CONFLICT (code, teacher_id) DO NOTHING;
