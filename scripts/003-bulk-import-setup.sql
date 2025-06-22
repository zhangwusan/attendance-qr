-- Create temporary tables for bulk import validation
CREATE TABLE IF NOT EXISTS temp_teachers (
    email VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    department VARCHAR(100),
    phone VARCHAR(20),
    employee_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS temp_students (
    email VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    student_id VARCHAR(50),
    program VARCHAR(100),
    year_level INTEGER,
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS temp_courses (
    name VARCHAR(255),
    code VARCHAR(50),
    teacher_email VARCHAR(255),
    room VARCHAR(100),
    time_slot VARCHAR(50),
    days_of_week TEXT,
    default_qr_duration INTEGER,
    credits INTEGER,
    description TEXT
);

-- Create indexes for faster lookups during import
CREATE INDEX IF NOT EXISTS idx_temp_teachers_email ON temp_teachers(email);
CREATE INDEX IF NOT EXISTS idx_temp_students_email ON temp_students(email);
CREATE INDEX IF NOT EXISTS idx_temp_students_id ON temp_students(student_id);
CREATE INDEX IF NOT EXISTS idx_temp_courses_teacher ON temp_courses(teacher_email);
CREATE INDEX IF NOT EXISTS idx_temp_courses_code ON temp_courses(code);
