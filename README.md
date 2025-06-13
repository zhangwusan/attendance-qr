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

- **Backend Features:**
  - PostgreSQL Database
  - Session Validation
  - Real-time Updates
  - Security features

## Setup Instructions

### Option 1: Using Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run the application:
   \`\`\`
   docker-compose up
   \`\`\`
4. Access the application at http://localhost:5000

### Option 2: Manual Setup

1. Install PostgreSQL and create a database named "attendance"
2. Clone this repository
3. Create a virtual environment:
   \`\`\`
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`
4. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`
5. Set environment variables:
   \`\`\`
   export DATABASE_URL="postgresql://username:password@localhost/attendance"
   export SECRET_KEY="your_secret_key_here"
   \`\`\`
6. Initialize the database:
   \`\`\`
   python seed_data.py
   \`\`\`
7. Run the application:
   \`\`\`
   python run.py
   \`\`\`
8. Access the application at http://localhost:5000

## Demo Credentials

### Teacher Login
- Email: teacher1@institute.edu
- Password: demo123

### Student Login
- Email: student1@institute.edu
- Password: demo123

## System Requirements

- Python 3.8+
- PostgreSQL 12+
- Modern web browser with camera access (for QR scanning)
