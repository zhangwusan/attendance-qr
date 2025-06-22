# Bulk Data Import Guide

This guide explains how to import teachers, students, and courses into the QR Attendance System.

## 🚀 Quick Start

1. **Access the Import Page**: Navigate to `/admin/import` in your application
2. **Choose Format**: Select CSV or JSON format
3. **Download Templates**: Use the provided templates as a starting point
4. **Import in Order**: Teachers → Students → Courses

## 📋 Import Order

**IMPORTANT**: Import data in this specific order:

1. **Teachers First** - Required for course assignments
2. **Students Second** - Can be imported independently
3. **Courses Last** - Requires existing teachers

## 📁 File Formats

### CSV Format

#### Teachers CSV
\`\`\`csv
email,name,password,department,phone,employee_id
john.doe@university.edu,Dr. John Doe,password123,Computer Science,+1234567890,EMP001
\`\`\`

#### Students CSV
\`\`\`csv
email,name,student_id,password,program,year_level,phone
alice.johnson@university.edu,Alice Johnson,STU001,password123,Computer Science,2,+1234567895
\`\`\`

#### Courses CSV
\`\`\`csv
name,code,teacher_email,room,time_slot,days_of_week,default_qr_duration,credits,description
Software Engineering,CS301,john.doe@university.edu,Room 203,09:00-10:30,Monday;Wednesday;Friday,15,3,Introduction to software engineering
\`\`\`

### JSON Format

#### Teachers JSON
\`\`\`json
[
  {
    "email": "john.doe@university.edu",
    "name": "Dr. John Doe",
    "password": "password123",
    "department": "Computer Science",
    "phone": "+1234567890",
    "employee_id": "EMP001"
  }
]
\`\`\`

## 🔧 Field Requirements

### Teachers
- **Required**: email, name
- **Optional**: password, department, phone, employee_id
- **Auto-generated**: Random password if not provided

### Students
- **Required**: email, name, student_id
- **Optional**: password, program, year_level, phone
- **Auto-generated**: Random password if not provided

### Courses
- **Required**: name, code, teacher_email, room, time_slot, days_of_week
- **Optional**: default_qr_duration, credits, description
- **Default**: default_qr_duration = 10 minutes

## 📅 Time Slots

Use these standard time slots:
- 08:00-09:30
- 09:00-10:30
- 10:00-11:30
- 11:00-12:30
- 13:00-14:30
- 14:00-15:30
- 15:00-16:30
- 16:00-17:30
- 17:00-18:30
- 18:00-19:30

## 📆 Days of Week

### CSV Format
Use semicolon-separated values:
\`\`\`
Monday;Wednesday;Friday
\`\`\`

### JSON Format
Use array format:
\`\`\`json
["Monday", "Wednesday", "Friday"]
\`\`\`

## ✅ Validation Rules

### Email Validation
- Must be valid email format
- Must be unique within role (teacher/student)

### Student ID Validation
- Must be unique across all students
- Required for all students

### Course Code Validation
- Must be unique per teacher
- Different teachers can have same course codes

### Teacher Assignment
- teacher_email must match existing teacher
- Case-sensitive email matching

## 🔄 Import Process

1. **File Upload**: Select and upload your CSV/JSON file
2. **Validation**: System validates all data before import
3. **Duplicate Check**: Existing records are skipped
4. **Batch Import**: Valid records are imported in batches
5. **Results Report**: Detailed report with success/error counts

## 📊 Import Results

After import, you'll see:
- **Success Count**: Number of records imported
- **Error List**: Validation errors with details
- **Duplicate List**: Skipped records that already exist

## 🛠️ Troubleshooting

### Common Issues

1. **Teacher Not Found**
   - Ensure teachers are imported before courses
   - Check email spelling and case sensitivity

2. **Duplicate Emails**
   - Each email must be unique within its role
   - Check for existing records in the system

3. **Invalid Time Slots**
   - Use only the predefined time slot formats
   - Ensure proper HH:MM-HH:MM format

4. **Invalid Days**
   - Use full day names (Monday, Tuesday, etc.)
   - Check semicolon separation in CSV format

### File Format Issues

1. **CSV Encoding**
   - Save files as UTF-8 encoding
   - Avoid special characters in CSV

2. **JSON Syntax**
   - Validate JSON syntax before upload
   - Use proper array and object formatting

## 📈 Best Practices

1. **Start Small**: Test with a few records first
2. **Backup Data**: Keep original files as backup
3. **Validate First**: Check data format before import
4. **Import Order**: Always follow Teachers → Students → Courses
5. **Review Results**: Check import results for errors

## 🔐 Security Notes

- Passwords are automatically hashed during import
- Random passwords are generated if not provided
- All imports require admin/teacher authentication
- Import logs are maintained for audit purposes

## 📞 Support

If you encounter issues:
1. Check the import results for specific error messages
2. Verify your data format against the templates
3. Ensure proper import order (Teachers → Students → Courses)
4. Contact system administrator for database-level issues
