# Railway Production Deployment Guide

Complete guide for deploying the QR Attendance System to Railway.

## 🚂 Pre-Deployment Setup

### 1. Railway Account Setup
1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### 2. Database Setup
1. Create a new Railway project
2. Add PostgreSQL database service
3. Note the `DATABASE_URL` from the database service

### 3. Environment Variables
Set these in Railway dashboard:

**Required:**
\`\`\`bash
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=production
\`\`\`

**Optional:**
\`\`\`bash
NEXT_TELEMETRY_DISABLED=1
PORT=3000
\`\`\`

## 🚀 Deployment Steps

### Method 1: GitHub Integration (Recommended)
1. Push code to GitHub repository
2. Connect Railway to your GitHub repo
3. Railway will auto-deploy on push

### Method 2: Railway CLI
\`\`\`bash
# Initialize Railway project
railway init

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL="your-database-url"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"
\`\`\`

### Method 3: Docker Deployment
\`\`\`bash
# Build and deploy with Docker
railway up --dockerfile Dockerfile.railway
\`\`\`

## 🔧 Post-Deployment Setup

### 1. Run Database Migrations
\`\`\`bash
# Via Railway CLI
railway run node scripts/init-db.js

# Or via Railway dashboard terminal
node scripts/init-db.js
\`\`\`

### 2. Setup Production Environment
\`\`\`bash
# Run Railway setup script
railway run npm run railway:setup
\`\`\`

### 3. Health Check
\`\`\`bash
# Check deployment health
curl https://your-app.railway.app/api/railway/health
\`\`\`

## 📊 Monitoring & Maintenance

### Health Monitoring
- Health endpoint: `/api/railway/health`
- Railway automatically monitors this endpoint
- Alerts available in Railway dashboard

### Logs
\`\`\`bash
# View logs via CLI
railway logs

# Or check Railway dashboard
\`\`\`

### Database Backups
1. Railway provides automatic backups for PostgreSQL
2. Manual backup: Use Railway dashboard or CLI
3. Consider setting up additional backup strategy

## 🔒 Security Checklist

- ✅ Strong JWT_SECRET (32+ characters)
- ✅ HTTPS enforced (automatic on Railway)
- ✅ Environment variables secured
- ✅ Default admin password changed
- ✅ Database access restricted
- ✅ Security headers configured

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
\`\`\`bash
# Check build logs
railway logs --deployment

# Common fixes:
- Verify package.json dependencies
- Check Node.js version compatibility
- Ensure all environment variables are set
\`\`\`

**Database Connection Issues:**
\`\`\`bash
# Test database connection
railway run node -e "console.log(process.env.DATABASE_URL)"

# Run health check
railway run curl http://localhost:3000/api/railway/health
\`\`\`

**Authentication Problems:**
\`\`\`bash
# Verify JWT_SECRET is set
railway variables

# Test JWT functionality
railway run npm run railway:setup
\`\`\`

### Performance Optimization

**Railway-Specific:**
- Use `output: 'standalone'` in next.config.js ✅
- Enable compression and caching
- Monitor resource usage in Railway dashboard
- Scale replicas if needed

**Database:**
- Add database indexes for frequently queried fields
- Monitor query performance
- Consider connection pooling for high traffic

## 📈 Scaling

### Horizontal Scaling
\`\`\`bash
# Scale replicas via CLI
railway scale --replicas 2

# Or use Railway dashboard
\`\`\`

### Database Scaling
- Railway PostgreSQL auto-scales storage
- Monitor connection limits
- Consider read replicas for high read workloads

## 🔄 CI/CD Pipeline

### GitHub Actions Example
\`\`\`yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway/cli@v2
        with:
          command: up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
\`\`\`

## 📞 Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Application Health: `/api/railway/health`

## 🎯 Production Checklist

Before going live:

- [ ] Database migrations completed
- [ ] Admin user created and password changed
- [ ] All environment variables configured
- [ ] Health checks passing
- [ ] SSL certificate active
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
