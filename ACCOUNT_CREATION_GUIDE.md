# Account Creation Guide

This guide explains how to create accounts for all the teachers and students in your system.

## 📋 Prepared Data

I've created CSV files with all your real data:

### 👨‍🏫 Teachers (19 total)
- **File**: `real-data/teachers.csv`
- **Email Format**: `firstname.lastname@university.edu`
- **Default Password**: `teacher123`
- **Department**: Computer Science

### 🎓 Students (94 total)
- **File**: `real-data/students.csv`
- **Email Format**: `studentid@university.edu` (e.g., `e20211125@university.edu`)
- **Default Password**: `student123`
- **Program**: Computer Science
- **Year Level**: Based on student ID (2020 = Year 4, 2021 = Year 3)

### 📚 Sample Courses (8 total)
- **File**: `real-data/sample-courses.csv`
- **Assigned to different teachers**
- **Various time slots and days**

## 🚀 How to Create Accounts

### Method 1: Using the Web Interface

1. **Access Import Page**
   \`\`\`
   Navigate to: /admin/import
   \`\`\`

2. **Import Teachers First**
   - Go to "Teachers" tab
   - Click "Download Template" to see format
   - Upload `real-data/teachers.csv`
   - Review results

3. **Import Students**
   - Go to "Students" tab
   - Upload `real-data/students.csv`
   - Review results

4. **Import Courses (Optional)**
   - Go to "Courses" tab
   - Upload `real-data/sample-courses.csv`
   - Review results

### Method 2: Using Python Script

1. **Install Requirements**
   \`\`\`bash
   pip install requests
   \`\`\`

2. **Run the Script**
   \`\`\`bash
   python scripts/create_accounts.py
   \`\`\`

3. **Check Results**
   - The script will show import progress
   - Any errors will be displayed
   - Success summary at the end

## 📧 Login Credentials

### Teachers
| Name | Email | Password |
|------|-------|----------|
| Dr. LIN Mongkolsery | lin.mongkolsery@university.edu | teacher123 |
| Dr. PHAUK Sokkhey | phauk.sokkhey@university.edu | teacher123 |
| Mr. PHOK Ponna | phok.ponna@university.edu | teacher123 |
| ... | ... | teacher123 |

### Students
| Student ID | Name | Email | Password |
|------------|------|-------|----------|
| e20211125 | AN HENGHENG | e20211125@university.edu | student123 |
| e20210271 | BO SANE | e20210271@university.edu | student123 |
| e20210320 | BUN RATNATEPY | e20210320@university.edu | student123 |
| ... | ... | ... | student123 |

## 🔧 Customization Options

### Change Default Passwords
Edit the CSV files before importing:
- Column 3 for teachers: `password`
- Column 4 for students: `password`

### Change Email Domain
Replace `@university.edu` with your institution's domain in the CSV files.

### Add More Information
You can add additional fields like:
- Phone numbers
- Departments for teachers
- Different programs for students

## 🛡️ Security Notes

1. **Change Default Passwords**: Users should change their passwords on first login
2. **Email Verification**: Consider implementing email verification
3. **Password Policy**: Enforce strong password requirements
4. **Account Activation**: You may want to require admin activation

## 📊 Import Statistics

- **19 Teachers** ready to import
- **94 Students** ready to import
- **8 Sample Courses** with realistic schedules
- **All data validated** and formatted correctly

## 🔍 Troubleshooting

### Common Issues:
1. **Duplicate Emails**: The system will skip existing accounts
2. **Invalid Email Format**: Check for typos in email addresses
3. **Missing Required Fields**: Ensure name and email are provided
4. **Teacher Not Found**: Import teachers before courses

### Error Resolution:
- Check the import results for detailed error messages
- Fix data in CSV files and re-import
- Contact support if issues persist

## 🎯 Next Steps

After creating accounts:
1. **Test Login**: Try logging in with a few accounts
2. **Create Courses**: Teachers can create their own courses
3. **Generate QR Codes**: Start taking attendance
4. **Train Users**: Provide login credentials to teachers and students
5. **Monitor Usage**: Check attendance reports and system usage

Your QR attendance system is now ready for production use! 🎉
