-- Direct SQL examples for creating accounts
-- Use these if you have direct database access

-- Create Teachers
INSERT INTO users (email, password_hash, name, role, employee_id, department, phone, created_at)
VALUES 
  ('newteacher@ams.edu', '$2b$12$hash_here', 'New Teacher Name', 'teacher', 'EMP999', 'Computer Science', '+855-12-999-001', NOW()),
  ('another.teacher@ams.edu', '$2b$12$hash_here', 'Another Teacher', 'teacher', 'EMP998', 'Information Technology', '+855-12-999-002', NOW());

-- Create Students  
INSERT INTO users (email, password_hash, name, role, student_id, program, year_level, phone, created_at)
VALUES 
  ('newstudent@ams.edu', '$2b$12$hash_here', 'NEW STUDENT', 'student', 'NEW001', 'Computer Science', 3, '+855-12-888-001', NOW()),
  ('another.student@ams.edu', '$2b$12$hash_here', 'ANOTHER STUDENT', 'student', 'NEW002', 'Information Technology', 2, '+855-12-888-002', NOW());

-- Note: Replace '$2b$12$hash_here' with actual password hashes
-- For password 'teacher123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L6jIq4B2i
-- For password 'student123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L6jIq4B2i
