from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timedelta, time
import uuid
import json

app = Flask(__name__)

# Production configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback_secret_key_change_in_production')

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    student_id = db.Column(db.String(50), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    code = db.Column(db.String(50), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    room = db.Column(db.String(100), nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)  # e.g., "7-9am", "9-11am", "1-3pm", "3-5pm"
    days_of_week = db.Column(db.String(50), nullable=False)  # e.g., "Mon,Wed,Fri"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    teacher = db.relationship('User', backref='courses')

class Session(db.Model):
    __tablename__ = 'sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    qr_code = db.Column(db.String(500), unique=True, nullable=False)
    qr_expires_at = db.Column(db.DateTime, nullable=False)
    session_date = db.Column(db.Date, nullable=False)
    session_time = db.Column(db.Time, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    course = db.relationship('Course', backref='sessions')
    teacher = db.relationship('User', backref='sessions')
    attendances = db.relationship('Attendance', backref='session', lazy='dynamic')

class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('sessions.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    scanned_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.Text)
    latitude = db.Column(db.Float)  # Student location
    longitude = db.Column(db.Float)  # Student location
    location_accuracy = db.Column(db.Float)  # GPS accuracy in meters
    
    student = db.relationship('User', backref='attendances')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Initialize database and seed data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Check if data already exists
        if User.query.count() > 0:
            return
        
        # Create demo users
        teacher1 = User(
            email='teacher@demo.com',
            name='Demo Teacher',
            role='teacher'
        )
        teacher1.set_password('demo123')
        
        student1 = User(
            email='student@demo.com',
            name='Demo Student',
            role='student',
            student_id='DEMO001'
        )
        student1.set_password('demo123')
        
        db.session.add_all([teacher1, student1])
        db.session.commit()
        
        # Create demo course
        course1 = Course(
            name='Software Engineering',
            code='CS301',
            teacher_id=teacher1.id,
            room='Room 203',
            time_slot='7-9am',
            days_of_week='Mon,Wed,Fri'
        )
        
        course2 = Course(
            name='Database Systems',
            code='CS302',
            teacher_id=teacher1.id,
            room='Room 205',
            time_slot='9-11am',
            days_of_week='Tue,Thu'
        )
        
        db.session.add_all([course1, course2])
        db.session.commit()

# Helper functions
def generate_qr_code(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def create_session(course_id, teacher_id):
    Session.query.filter_by(course_id=course_id, is_active=True).update({'is_active': False})
    db.session.commit()
    
    qr_code = f"QR_{uuid.uuid4().hex[:16]}_{int(datetime.utcnow().timestamp())}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)  # Extended to 15 minutes
    
    session = Session(
        course_id=course_id,
        teacher_id=teacher_id,
        qr_code=qr_code,
        qr_expires_at=expires_at,
        session_date=datetime.utcnow().date(),
        session_time=datetime.utcnow().time(),
        is_active=True
    )
    
    db.session.add(session)
    db.session.commit()
    return session

def get_time_slots():
    return [
        {'value': '7-9am', 'label': '7:00 AM - 9:00 AM'},
        {'value': '9-11am', 'label': '9:00 AM - 11:00 AM'},
        {'value': '1-3pm', 'label': '1:00 PM - 3:00 PM'},
        {'value': '3-5pm', 'label': '3:00 PM - 5:00 PM'}
    ]

def get_days_of_week():
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

# Routes
@app.route('/')
def index():
    return render_template('demo_info.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        if current_user.role == 'teacher':
            return redirect(url_for('teacher_dashboard'))
        else:
            return redirect(url_for('student_dashboard'))
            
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password) and user.role == role:
            login_user(user)
            if user.role == 'teacher':
                return redirect(url_for('teacher_dashboard'))
            else:
                return redirect(url_for('student_dashboard'))
        else:
            flash('Invalid credentials or wrong role', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/teacher')
@login_required
def teacher_dashboard():
    if current_user.role != 'teacher':
        return redirect(url_for('login'))
        
    courses = Course.query.filter_by(teacher_id=current_user.id).all()
    active_session = Session.query.filter_by(teacher_id=current_user.id, is_active=True).first()
    
    qr_image = None
    if active_session:
        qr_image = generate_qr_code(active_session.qr_code)
        
    return render_template('teacher_dashboard.html', 
                          courses=courses, 
                          active_session=active_session,
                          qr_image=qr_image,
                          time_slots=get_time_slots(),
                          days_of_week=get_days_of_week())

@app.route('/student')
@login_required
def student_dashboard():
    if current_user.role != 'student':
        return redirect(url_for('login'))
        
    return render_template('student_dashboard.html')

# API Routes
@app.route('/api/create-course', methods=['POST'])
@login_required
def create_course():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    name = data.get('name')
    code = data.get('code')
    room = data.get('room')
    time_slot = data.get('time_slot')
    days_of_week = data.get('days_of_week')
    
    if not all([name, code, room, time_slot, days_of_week]):
        return jsonify({'error': 'All fields are required'}), 400
    
    # Check if course code already exists for this teacher
    existing_course = Course.query.filter_by(code=code, teacher_id=current_user.id).first()
    if existing_course:
        return jsonify({'error': 'Course code already exists'}), 400
    
    course = Course(
        name=name,
        code=code,
        teacher_id=current_user.id,
        room=room,
        time_slot=time_slot,
        days_of_week=','.join(days_of_week)
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'course': {
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'room': course.room,
            'time_slot': course.time_slot,
            'days_of_week': course.days_of_week
        }
    })

@app.route('/api/generate-qr', methods=['POST'])
@login_required
def generate_qr():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
        
    course_id = request.json.get('course_id')
    if not course_id:
        return jsonify({'error': 'Course ID is required'}), 400
        
    session = create_session(course_id, current_user.id)
    course = Course.query.get(course_id)
    qr_image = generate_qr_code(session.qr_code)
    
    return jsonify({
        'session_id': session.id,
        'qr_code': session.qr_code,
        'qr_image': qr_image,
        'expires_at': session.qr_expires_at.isoformat(),
        'course_name': course.name,
        'room': course.room,
        'time_slot': course.time_slot
    })

@app.route('/api/scan-qr', methods=['POST'])
@login_required
def scan_qr():
    if current_user.role != 'student':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.json
    qr_code = data.get('qr_code')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    accuracy = data.get('accuracy')
    
    if not qr_code:
        return jsonify({'error': 'QR code is required'}), 400
        
    session = Session.query.filter_by(qr_code=qr_code, is_active=True).first()
    if not session:
        return jsonify({'error': 'Invalid QR code'}), 400
        
    if datetime.utcnow() > session.qr_expires_at:
        return jsonify({'error': 'QR code has expired. Please contact your teacher.'}), 400
        
    existing = Attendance.query.filter_by(session_id=session.id, student_id=current_user.id).first()
    if existing:
        return jsonify({'error': 'You have already been marked present for this session'}), 400
        
    attendance = Attendance(
        session_id=session.id,
        student_id=current_user.id,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string,
        latitude=latitude,
        longitude=longitude,
        location_accuracy=accuracy
    )
    
    db.session.add(attendance)
    db.session.commit()
    
    current_time = datetime.utcnow()
    
    return jsonify({
        'success': True,
        'message': f"✅ Your attendance has been recorded at {current_time.strftime('%I:%M:%S %p')}",
        'scanned_at': attendance.scanned_at.isoformat(),
        'location_recorded': latitude is not None and longitude is not None
    })

@app.route('/api/attendance/<int:session_id>')
@login_required
def get_attendance(session_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
        
    session = Session.query.filter_by(id=session_id, teacher_id=current_user.id).first()
    if not session:
        return jsonify({'error': 'Session not found'}), 404
        
    attendance_records = db.session.query(
        Attendance, User.name, User.student_id, User.email
    ).join(User, Attendance.student_id == User.id).filter(
        Attendance.session_id == session_id
    ).order_by(Attendance.scanned_at.desc()).all()
    
    attendance_list = []
    for record, name, student_id, email in attendance_records:
        attendance_list.append({
            'id': record.id,
            'student_id': record.student_id,
            'name': name,
            'student_id': student_id,
            'email': email,
            'scanned_at': record.scanned_at.isoformat(),
            'latitude': record.latitude,
            'longitude': record.longitude,
            'location_accuracy': record.location_accuracy
        })
    
    return jsonify({'attendance': attendance_list})

@app.route('/api/courses')
@login_required
def get_courses():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
        
    courses = Course.query.filter_by(teacher_id=current_user.id).all()
    course_list = []
    
    for course in courses:
        course_list.append({
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'room': course.room,
            'time_slot': course.time_slot,
            'days_of_week': course.days_of_week
        })
    
    return jsonify({'courses': course_list})

@app.route('/api/delete-course/<int:course_id>', methods=['DELETE'])
@login_required
def delete_course(course_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    course = Course.query.filter_by(id=course_id, teacher_id=current_user.id).first()
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Delete related sessions and attendance records
    sessions = Session.query.filter_by(course_id=course_id).all()
    for session in sessions:
        Attendance.query.filter_by(session_id=session.id).delete()
        db.session.delete(session)
    
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({'success': True})

# Initialize database on startup
init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
