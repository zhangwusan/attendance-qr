from app import app, db, User, Course
from werkzeug.security import generate_password_hash
from datetime import datetime

def seed_database():
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if data already exists
        if User.query.count() > 0:
            print("Database already seeded. Skipping.")
            return
        
        # Create teachers
        teacher1 = User(
            email='teacher1@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='Dr. Sarah Johnson',
            role='teacher'
        )
        
        teacher2 = User(
            email='teacher2@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='Prof. Michael Chen',
            role='teacher'
        )
        
        # Create students
        student1 = User(
            email='student1@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='Sok Dara',
            role='student',
            student_id='20250124'
        )
        
        student2 = User(
            email='student2@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='John Smith',
            role='student',
            student_id='20250125'
        )
        
        student3 = User(
            email='student3@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='Maria Garcia',
            role='student',
            student_id='20250126'
        )
        
        student4 = User(
            email='student4@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='Ahmed Hassan',
            role='student',
            student_id='20250127'
        )
        
        student5 = User(
            email='student5@institute.edu',
            password_hash=generate_password_hash('demo123'),
            name='Lisa Wang',
            role='student',
            student_id='20250128'
        )
        
        db.session.add_all([teacher1, teacher2, student1, student2, student3, student4, student5])
        db.session.commit()
        
        # Create courses
        course1 = Course(
            name='Software Engineering',
            code='CS301',
            teacher_id=teacher1.id,
            room='Room 203'
        )
        
        course2 = Course(
            name='Database Systems',
            code='CS302',
            teacher_id=teacher1.id,
            room='Room 205'
        )
        
        course3 = Course(
            name='Web Development',
            code='CS303',
            teacher_id=teacher2.id,
            room='Room 201'
        )
        
        course4 = Course(
            name='Data Structures',
            code='CS201',
            teacher_id=teacher2.id,
            room='Room 204'
        )
        
        db.session.add_all([course1, course2, course3, course4])
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
