#!/usr/bin/env python3
"""
Manual account creation script
Run this to create individual accounts or small batches
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, User
from werkzeug.security import generate_password_hash

def create_teacher(email, name, password="teacher123", employee_id=None, department=None, phone=None):
    """Create a single teacher account"""
    with app.app_context():
        try:
            # Check if teacher already exists
            existing = User.query.filter_by(email=email).first()
            if existing:
                print(f"❌ Teacher {email} already exists")
                return False
            
            teacher = User(
                email=email.lower().strip(),
                name=name.strip(),
                role='teacher',
                employee_id=employee_id,
                department=department,
                phone=phone
            )
            teacher.set_password(password)
            
            db.session.add(teacher)
            db.session.commit()
            
            print(f"✅ Teacher created: {name} ({email})")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating teacher {email}: {str(e)}")
            return False

def create_student(email, name, student_id, password="student123", program=None, year_level=None, phone=None):
    """Create a single student account"""
    with app.app_context():
        try:
            # Check if student already exists
            existing = User.query.filter(
                (User.email == email) | (User.student_id == student_id)
            ).first()
            if existing:
                print(f"❌ Student {email} or ID {student_id} already exists")
                return False
            
            student = User(
                email=email.lower().strip(),
                name=name.strip(),
                role='student',
                student_id=student_id.strip(),
                program=program,
                year_level=year_level,
                phone=phone
            )
            student.set_password(password)
            
            db.session.add(student)
            db.session.commit()
            
            print(f"✅ Student created: {name} ({email}) - ID: {student_id}")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating student {email}: {str(e)}")
            return False

def create_batch_teachers():
    """Create multiple teachers at once"""
    teachers = [
        {
            'email': 'john.doe@ams.edu',
            'name': 'Dr. John Doe',
            'employee_id': 'EMP100',
            'department': 'Computer Science',
            'phone': '+855-12-100-001'
        },
        {
            'email': 'jane.smith@ams.edu',
            'name': 'Prof. Jane Smith',
            'employee_id': 'EMP101',
            'department': 'Information Technology',
            'phone': '+855-12-100-002'
        }
    ]
    
    success_count = 0
    for teacher in teachers:
        if create_teacher(**teacher):
            success_count += 1
    
    print(f"\n📊 Created {success_count}/{len(teachers)} teachers")

def create_batch_students():
    """Create multiple students at once"""
    students = [
        {
            'email': 'student001@ams.edu',
            'name': 'STUDENT ONE',
            'student_id': 'STU001',
            'program': 'Computer Science',
            'year_level': 3,
            'phone': '+855-12-200-001'
        },
        {
            'email': 'student002@ams.edu',
            'name': 'STUDENT TWO',
            'student_id': 'STU002',
            'program': 'Information Technology',
            'year_level': 2,
            'phone': '+855-12-200-002'
        }
    ]
    
    success_count = 0
    for student in students:
        if create_student(**student):
            success_count += 1
    
    print(f"\n📊 Created {success_count}/{len(students)} students")

def interactive_create():
    """Interactive account creation"""
    print("🎯 Interactive Account Creation")
    print("=" * 40)
    
    while True:
        print("\nChoose an option:")
        print("1. Create Teacher")
        print("2. Create Student")
        print("3. Create Batch Teachers")
        print("4. Create Batch Students")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            print("\n📝 Creating Teacher Account")
            email = input("Email: ").strip()
            name = input("Full Name: ").strip()
            password = input("Password (default: teacher123): ").strip() or "teacher123"
            employee_id = input("Employee ID (optional): ").strip() or None
            department = input("Department (optional): ").strip() or None
            phone = input("Phone (optional): ").strip() or None
            
            create_teacher(email, name, password, employee_id, department, phone)
            
        elif choice == '2':
            print("\n📝 Creating Student Account")
            email = input("Email: ").strip()
            name = input("Full Name: ").strip()
            student_id = input("Student ID: ").strip()
            password = input("Password (default: student123): ").strip() or "student123"
            program = input("Program (optional): ").strip() or None
            year_level = input("Year Level (optional): ").strip()
            year_level = int(year_level) if year_level.isdigit() else None
            phone = input("Phone (optional): ").strip() or None
            
            create_student(email, name, student_id, password, program, year_level, phone)
            
        elif choice == '3':
            create_batch_teachers()
            
        elif choice == '4':
            create_batch_students()
            
        elif choice == '5':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'teachers':
            create_batch_teachers()
        elif sys.argv[1] == 'students':
            create_batch_students()
        elif sys.argv[1] == 'interactive':
            interactive_create()
        else:
            print("Usage: python manual_account_creation.py [teachers|students|interactive]")
    else:
        interactive_create()
