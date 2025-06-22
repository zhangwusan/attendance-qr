# Timezone and Email Domain Update Guide

## 📧 Email Domain Changes

All email addresses have been updated from `@university.edu` to `@ams.edu`:

### Teachers (19 accounts)
- `lin.mongkolsery@ams.edu` → Dr. LIN Mongkolsery
- `phauk.sokkhey@ams.edu` → Dr. PHAUK Sokkhey
- ... (all 19 teachers updated)

### Students (94 accounts)  
- `e20211125@ams.edu` → AN HENGHENG
- `e20210271@ams.edu` → BO SANE
- ... (all 94 students updated)

## 🕐 Timezone Features Added

### Local Time Display
- **Current Time**: Shows user's local time in real-time
- **Scan Time**: Attendance records show local time instead of UTC
- **QR Expiry**: QR code expiration times shown in local timezone
- **CSV Export**: Includes both local time and UTC timestamps

### Automatic Timezone Detection
- Detects user's browser timezone automatically
- Fallback to `Asia/Phnom_Penh` (Cambodia timezone) if detection fails
- Supports all global timezones

### Enhanced Features
1. **Real-time Clock**: Updates every second on dashboards
2. **Timezone Display**: Shows current timezone (e.g., "GMT+07:00")
3. **Localized Messages**: Success messages show local time
4. **CSV Export**: Dual timestamps (local + UTC) for record keeping

## 🚀 Updated Login Credentials

### Teachers
- **Email**: `lin.mongkolsery@ams.edu`
- **Password**: `teacher123`

### Students  
- **Email**: `e20211125@ams.edu` (AN HENGHENG)
- **Password**: `student123`

## 📱 User Experience Improvements

### For Students
- See current local time when scanning
- Attendance confirmation shows local time
- Timezone information displayed clearly

### For Teachers
- Dashboard shows current local time
- Session creation times in local timezone
- Attendance reports with local timestamps
- CSV exports include timezone information

## 🔧 Technical Implementation

### Timezone Detection
\`\`\`javascript
// Automatic timezone detection
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
// Fallback: 'Asia/Phnom_Penh'
\`\`\`

### Time Formatting
\`\`\`javascript
// Local time display
formatLocalTime(date, timezone)
// Time only display  
formatLocalTimeOnly(date, timezone)
\`\`\`

### API Updates
- Attendance scan API accepts timezone header
- Returns both UTC and local timestamps
- Validates timezone information

## 📊 Database Considerations

- All timestamps stored in UTC (standard practice)
- Local time calculated on display
- Timezone information logged for audit trail
- CSV exports include both formats

This ensures consistent data storage while providing localized user experience!
