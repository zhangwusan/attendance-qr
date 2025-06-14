# QR-Based Attendance System

A real-time attendance tracking system using QR codes, built with Python Flask and PostgreSQL.

## Features

- **Teacher Features:**
  - Login & Dashboard
  - QR Code Generation for class sessions
  - Live Attendance Tracking
  - Session Management with 10-minute QR expiration
  - Export Functionality (CSV)

- **Student Features:**
  - Mobile-Friendly Interface
  - QR Scanner with camera support
  - Manual QR code entry option
  - Instant Feedback on attendance recording

## Demo Credentials

### Teacher Login
- Email: teacher@demo.com
- Password: demo123

### Student Login
- Email: student@demo.com
- Password: demo123

## Deployment on Railway

1. Fork this repository
2. Create a new project on Railway
3. Deploy from GitHub repo
4. Add PostgreSQL database
5. Set environment variables:
   - SECRET_KEY: your-secret-key-here

## Local Development

1. Clone the repository
2. Create a virtual environment:
   \`\`\`
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`
3. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`
4. Run the application:
   \`\`\`
   python app.py
   \`\`\`
5. Access at http://localhost:5000

## Testing

For best experience, test with:
- Desktop browser for teacher interface
- Mobile device for student QR scanning
\`\`\`
