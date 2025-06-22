#!/usr/bin/env python3
"""
Quick setup script to create essential accounts
Run this first to get started quickly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, User, Course

def create_essential_accounts():
    """Create essential accounts for testing"""
    with app.app_context():
        print("🚀 Creating Essential Accounts...")
        print("=" * 40)
        
        # Create admin account
        admin = User(
            email='admin@ams.edu',
            name='System Administrator',
            role='teacher',
            employee_id='ADMIN001'
        )
        admin.set_password('admin123')
        
        # Create sample teacher
        teacher = User(
            email='teacher@ams.edu',
            name='Demo Teacher',
            role='teacher',
            employee_id='TEACH001',
            department='Computer Science'
        )
        teacher.set_password('teacher123')
        
        # Create sample students
        student1 = User(
            email='student1@ams.edu',
            name='Demo Student One',
            role='student',
            student_id='DEMO001',
            program='Computer Science',
            year_level=3
        )
        student1.set_password('student123')
        
        student2 = User(
            email='student2@ams.edu',
            name='Demo Student Two',
            role='student',
            student_id='DEMO002',
            program='Information Technology',
            year_level=2
        )
        student2.set_password('student123')
        
        try:
            # Check if accounts already exist
            existing_admin = User.query.filter_by(email='admin@ams.edu').first()
            if not existing_admin:
                db.session.add(admin)
                print("✅ Admin account created: admin@ams.edu / admin123")
            else:
                print("⚠️  Admin account already exists")
            
            existing_teacher = User.query.filter_by(email='teacher@ams.edu').first()
            if not existing_teacher:
                db.session.add(teacher)
                print("✅ Teacher account created: teacher@ams.edu / teacher123")
            else:
                print("⚠️  Teacher account already exists")
            
            existing_student1 = User.query.filter_by(email='student1@ams.edu').first()
            if not existing_student1:
                db.session.add(student1)
                print("✅ Student 1 created: student1@ams.edu / student123")
            else:
                print("⚠️  Student 1 already exists")
            
            existing_student2 = User.query.filter_by(email='student2@ams.edu').first()
            if not existing_student2:
                db.session.add(student2)
                print("✅ Student 2 created: student2@ams.edu / student123")
            else:
                print("⚠️  Student 2 already exists")
            
            db.session.commit()
            
            # Create sample course
            if not existing_teacher:
                teacher_id = teacher.id
            else:
                teacher_id = existing_teacher.id
            
            existing_course = Course.query.filter_by(code='DEMO101').first()
            if not existing_course:
                course = Course(
                    name='Demo Course',
                    code='DEMO101',
                    teacher_id=teacher_id,
                    room='Room 101',
                    time_slot='09:00-10:30',
                    days_of_week='Monday,Wednesday,Friday',
                    default_qr_duration=15
                )
                db.session.add(course)
                db.session.commit()
                print("✅ Demo course created: DEMO101")
            else:
                print("⚠️  Demo course already exists")
            
            print("\n🎉 Setup Complete!")
            print("\n📋 LOGIN CREDENTIALS:")
            print("Admin: admin@ams.edu / admin123")
            print("Teacher: teacher@ams.edu / teacher123")
            print("Student 1: student1@ams.edu / student123")
            print("Student 2: student2@ams.edu / student123")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error during setup: {str(e)}")

if __name__ == '__main__':
    create_essential_accounts()
