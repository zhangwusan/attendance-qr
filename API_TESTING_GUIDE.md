# API Testing Guide

This guide helps you verify that all API routes work correctly after the import fixes.

## Quick Start

1. **Run the health check first:**
   \`\`\`bash
   node scripts/api-health-check.js
   \`\`\`

2. **Create test users:**
   \`\`\`bash
   node scripts/create-test-users.js
   \`\`\`

3. **Run comprehensive tests:**
   \`\`\`bash
   node scripts/test-api-routes.js
   \`\`\`

## Manual Testing

### 1. Health Check
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`
Expected: `200 OK` with database status

### 2. Authentication
\`\`\`bash
# Teacher login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"teacher123","role":"teacher"}'

# Student login  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"student123","role":"student"}'
\`\`\`

### 3. Protected Routes (with auth cookie)
\`\`\`bash
# Get courses (teacher only)
curl http://localhost:3000/api/courses \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE"

# Get active sessions (teacher only)
curl http://localhost:3000/api/sessions/active \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE"
\`\`\`

## Expected Results

### ✅ Working Endpoints
- `/api/health` - Should return database status
- `/api/auth/login` - Should authenticate users
- `/api/auth/me` - Should return user info with valid token
- `/api/courses` - Should work for teachers
- `/api/sessions/*` - Should work for teachers
- `/api/attendance/scan` - Should work for students
- `/api/admin/*` - Should work for teachers/admins

### ❌ Common Issues
- **401 Unauthorized**: Missing or invalid auth token
- **403 Forbidden**: Wrong user role for endpoint
- **500 Internal Server Error**: Database connection or import issues

## Troubleshooting

### Import Errors
If you see import errors, check:
1. Function names match between imports and exports
2. File paths are correct
3. TypeScript types are properly imported

### Database Errors
If you see database errors:
1. Check `DATABASE_URL` environment variable
2. Run database migrations: `node scripts/init-db.js`
3. Verify database connection: `curl http://localhost:3000/api/health`

### Authentication Errors
If auth doesn't work:
1. Check `JWT_SECRET` environment variable
2. Verify test users exist in database
3. Check cookie settings in browser

## Test Coverage

The test suite covers:
- ✅ Authentication endpoints
- ✅ Course CRUD operations
- ✅ Session management
- ✅ Attendance scanning
- ✅ Admin functionality
- ✅ Error handling
- ✅ Authorization checks

## Next Steps

After verifying all routes work:
1. Run the full application: `npm run dev`
2. Test the UI functionality
3. Deploy to production environment
4. Set up monitoring and logging
