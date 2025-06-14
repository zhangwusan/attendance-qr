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
            email='teacher@demo.com',
            password_hash=generate_password_hash('demo123'),
            name='Demo Teacher',
            role='teacher'
        )
        
        # Create students
        student1 = User(
            email='student@demo.com',
            password_hash=generate_password_hash('demo123'),
            name='Demo Student',
            role='student',
            student_id='DEMO001'
        )
        
        db.session.add_all([teacher1, student1])
        db.session.commit()
        
        # Create courses
        course1 = Course(
            name='Demo Course',
            code='DEMO101',
            teacher_id=teacher1.id,
            room='Demo Room'
        )
        
        db.session.add(course1)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
