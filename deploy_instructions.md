# Deployment Instructions for QR Attendance System

## 🚀 Quick Deploy Options

### 1. Railway (Recommended - Easiest)

Railway provides free hosting with PostgreSQL database included.

**Steps:**
1. Fork this repository to your GitHub
2. Go to [Railway.app](https://railway.app)
3. Sign up with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your forked repository
6. Add PostgreSQL service:
   - Click "New" → "Database" → "Add PostgreSQL"
7. Set environment variables:
   - `SECRET_KEY`: Generate a random secret key
   - `DATABASE_URL`: Will be auto-set by Railway
8. Deploy!

**Cost:** Free tier includes 500 hours/month

---

### 2. Heroku

**Steps:**
1. Install Heroku CLI
2. Clone the repository
3. Create Heroku app:
   \`\`\`bash
   heroku create your-app-name
   \`\`\`
4. Add PostgreSQL addon:
   \`\`\`bash
   heroku addons:create heroku-postgresql:mini
   \`\`\`
5. Set environment variables:
   \`\`\`bash
   heroku config:set SECRET_KEY=your-secret-key
   \`\`\`
6. Deploy:
   \`\`\`bash
   git push heroku main
   \`\`\`

**Cost:** Free tier discontinued, starts at $5/month

---

### 3. Render

**Steps:**
1. Fork repository to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service from GitHub repo
4. Add PostgreSQL database
5. Set environment variables:
   - `SECRET_KEY`: Your secret key
   - `DATABASE_URL`: From PostgreSQL service
6. Deploy

**Cost:** Free tier available

---

### 4. PythonAnywhere

**Steps:**
1. Sign up at [PythonAnywhere.com](https://pythonanywhere.com)
2. Upload your code via Files tab
3. Create PostgreSQL database (paid feature)
4. Configure WSGI file
5. Set environment variables

**Cost:** Free tier available (limited)

---

### 5. DigitalOcean App Platform

**Steps:**
1. Fork repository
2. Go to DigitalOcean App Platform
3. Create app from GitHub
4. Add managed PostgreSQL database
5. Configure environment variables
6. Deploy

**Cost:** Starts at $5/month

---

## 🔧 Environment Variables Required

For all platforms, set these environment variables:

\`\`\`bash
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@host:port/database
FLASK_ENV=production
\`\`\`

## 📱 Testing Your Deployed App

1. **Share the URL** with testers
2. **Demo Credentials:**
   - Teacher: teacher@demo.com / demo123
   - Student: student@demo.com / demo123
3. **Mobile Testing:** Open on phones for QR scanning
4. **Desktop Testing:** Use multiple browser tabs

## 🎯 Quick Test Script

Share this with your testers:

\`\`\`
🎯 QR Attendance System Test

1. Visit: [YOUR_DEPLOYED_URL]
2. Try Teacher Login:
   📧 teacher@demo.com
   🔑 demo123
3. Generate QR code for "Demo Course"
4. Open new tab/phone browser
5. Try Student Login:
   📧 student@demo.com  
   🔑 demo123
6. Scan or manually enter the QR code
7. Watch live attendance update!
\`\`\`

## 💡 Pro Tips

- **Railway** is the easiest for beginners
- **Heroku** has the best documentation
- **Render** offers good free tier
- **DigitalOcean** is best for production

Choose based on your budget and technical comfort level!
\`\`\`

\`\`\`python file="requirements_production.txt"
Flask==2.3.3
Flask-SQLAlchemy==3.1.1
Flask-Login==0.6.2
psycopg2-binary==2.9.9
qrcode==7.4.2
Werkzeug==2.3.7
Jinja2==3.1.2
gunicorn==21.2.0
Pillow==10.0.1
