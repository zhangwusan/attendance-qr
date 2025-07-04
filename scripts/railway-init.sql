-- Railway Database Initialization Script
-- Run this script to set up the database for production

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  student_id VARCHAR(50) UNIQUE,
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  phone VARCHAR(20),
  program VARCHAR(100),
  year_level INTEGER,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  room VARCHAR(100),
  time_slot VARCHAR(50) NOT NULL,
  days_of_week TEXT NOT NULL,
  default_qr_duration INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, teacher_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  qr_code VARCHAR(500) UNIQUE NOT NULL,
  qr_expires_at TIMESTAMP NOT NULL,
  qr_duration INTEGER NOT NULL DEFAULT 10,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  manually_expired BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(8, 2),
  UNIQUE(session_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role, employee_id, department, is_admin)
VALUES (
  'admin@ams.edu',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9PS',
  'System Administrator',
  'admin',
  'ADMIN001',
  'IT Department',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert default teacher (password: teacher123)
INSERT INTO users (email, password_hash, name, role, employee_id, department)
VALUES (
  'teacher@ams.edu',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9PS',
  'Dr. Demo Teacher',
  'teacher',
  'EMP001',
  'Computer Science'
) ON CONFLICT (email) DO NOTHING;

-- Insert default student (password: student123)
INSERT INTO users (email, password_hash, name, role, student_id, program, year_level)
VALUES (
  'student@ams.edu',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9PS',
  'Demo Student',
  'student',
  'STU001',
  'Computer Science',
  3
) ON CONFLICT (email) DO NOTHING;

-- Insert demo course
INSERT INTO courses (name, code, teacher_id, room, time_slot, days_of_week, default_qr_duration)
SELECT 
  'Software Engineering',
  'CS301',
  u.id,
  'Room 203',
  '09:00-10:30',
  'Monday,Wednesday,Friday',
  15
FROM users u 
WHERE u.email = 'teacher@ams.edu'
ON CONFLICT (code, teacher_id) DO NOTHING;
