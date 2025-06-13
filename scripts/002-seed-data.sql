-- Insert sample data for testing

-- Insert sample teachers and students
INSERT INTO users (email, password_hash, name, role, student_id) VALUES
('teacher1@institute.edu', '$2b$10$example_hash_1', 'Dr. Sarah Johnson', 'teacher', NULL),
('teacher2@institute.edu', '$2b$10$example_hash_2', 'Prof. Michael Chen', 'teacher', NULL),
('student1@institute.edu', '$2b$10$example_hash_3', 'Sok Dara', 'student', '20250124'),
('student2@institute.edu', '$2b$10$example_hash_4', 'John Smith', 'student', '20250125'),
('student3@institute.edu', '$2b$10$example_hash_5', 'Maria Garcia', 'student', '20250126'),
('student4@institute.edu', '$2b$10$example_hash_6', 'Ahmed Hassan', 'student', '20250127'),
('student5@institute.edu', '$2b$10$example_hash_7', 'Lisa Wang', 'student', '20250128')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (name, code, teacher_id, room) VALUES
('Software Engineering', 'CS301', 1, 'Room 203'),
('Database Systems', 'CS302', 1, 'Room 205'),
('Web Development', 'CS303', 2, 'Room 201'),
('Data Structures', 'CS201', 2, 'Room 204')
ON CONFLICT DO NOTHING;
