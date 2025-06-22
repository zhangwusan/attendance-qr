-- Add admin role support
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create a dedicated admin account
INSERT INTO users (
  email, 
  name, 
  password_hash, 
  role, 
  is_admin,
  employee_id,
  department,
  created_at
) VALUES (
  'admin@ams.edu',
  'System Administrator',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
  'admin',
  TRUE,
  'ADM001',
  'IT Administration',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Update existing teacher to have admin privileges (optional)
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'teacher@ams.edu';
