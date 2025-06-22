-- QR Attendance System Database Schema
-- Institute of Technology of Cambodia - AMS Department

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
    student_id VARCHAR(50) UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    program VARCHAR(100),
    year_level INTEGER,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT unique_student_id CHECK (
        (role = 'student' AND student_id IS NOT NULL) OR 
        (role = 'teacher' AND student_id IS NULL)
    ),
    CONSTRAINT unique_employee_id CHECK (
        (role = 'teacher' AND employee_id IS NOT NULL) OR 
        (role = 'student' AND employee_id IS NULL)
    )
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room VARCHAR(100) NOT NULL,
    time_slot VARCHAR(50) NOT NULL CHECK (time_slot IN ('07:00-09:00', '09:00-11:00', '13:00-15:00', '15:00-17:00')),
    days_of_week TEXT NOT NULL,
    default_qr_duration INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, teacher_id)
);

-- Create indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_time_slot ON courses(time_slot);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_code VARCHAR(500) UNIQUE NOT NULL,
    qr_expires_at TIMESTAMP NOT NULL,
    qr_duration INTEGER NOT NULL DEFAULT 10,
    session_date DATE NOT NULL,
    session_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    manually_expired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_course_id ON sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_qr_code ON sessions(qr_code);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(qr_expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_accuracy DECIMAL(8, 2),
    ip_address VARCHAR(50),
    user_agent TEXT,
    UNIQUE(session_id, student_id)
);

-- Create indexes for attendance table
CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scanned_at ON attendance(scanned_at);

-- Create admin logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
