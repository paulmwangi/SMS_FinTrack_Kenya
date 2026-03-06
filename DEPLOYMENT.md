# SMS-FinTrack Kenya - Deployment Guide

This guide covers deploying SMS-FinTrack Kenya to various hosting platforms.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL 15 database
- Redis 7 (optional but recommended)
- Domain name (optional)
- SSL certificate (Let's Encrypt recommended)

## Environment Variables

Create `.env` files in both `backend` and `frontend` directories:

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Africa's Talking
AT_API_KEY=your-africas-talking-api-key
AT_USERNAME=your-africas-talking-username

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

### Frontend `.env`

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Deployment Options

### Option 1: Railway (Recommended for Beginners)

1. **Sign up at [Railway](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub repository

3. **Add PostgreSQL**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create a database

4. **Configure Backend Service**
   - Click "+ New" → "GitHub Repo"
   - Select `backend` directory
   - Add environment variables from `.env`
   - Set `DATABASE_URL` to the PostgreSQL connection string
   - Deploy!

5. **Configure Frontend Service**
   - Repeat for `frontend` directory
   - Set `VITE_API_URL` to backend URL
   - Deploy!

### Option 2: Render

1. **Sign up at [Render](https://render.com)**

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Note the connection string

3. **Create Backend Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables

4. **Create Frontend Static Site**
   - New → Static Site
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Option 3: DigitalOcean / VPS

1. **Create Droplet**
   ```bash
   # Ubuntu 22.04 LTS recommended
   # Minimum: 2GB RAM, 1 vCPU
   ```

2. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL 15
   sudo apt install -y postgresql postgresql-contrib

   # Install Redis (optional)
   sudo apt install -y redis-server

   # Install Docker (optional)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Setup PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE sms_fintrack;
   CREATE USER smsuser WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE sms_fintrack TO smsuser;
   \q
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/paulmwangi/SMS_FinTrack.git
   cd SMS_FinTrack
   ```

5. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   nano .env

   # Run migrations
   npm run prisma:migrate
   npm run prisma:generate

   # Build
   npm run build
   ```

6. **Setup PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start dist/index.js --name sms-fintrack-api
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx**
   ```bash
   sudo apt install -y nginx

   # Create Nginx config
   sudo nano /etc/nginx/sites-available/sms-fintrack
   ```

   Add this configuration:
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Frontend
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/sms-fintrack;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sms-fintrack /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

9. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build

   # Copy build to web server
   sudo mkdir -p /var/www/sms-fintrack
   sudo cp -r dist/* /var/www/sms-fintrack/
   ```

### Option 4: Docker Deployment

1. **Build and Run with Docker Compose**
   ```bash
   # Clone repository
   git clone https://github.com/paulmwangi/SMS_FinTrack.git
   cd SMS_FinTrack

   # Create .env files
   cp backend/.env.example backend/.env
   # Edit backend/.env

   # Build and start
   docker-compose up -d

   # Check logs
   docker-compose logs -f
   ```

2. **Production Docker Compose**
   ```yaml
   # Add to docker-compose.yml for production
   services:
     backend:
       restart: always
       environment:
         NODE_ENV: production
     
     frontend:
       restart: always
   ```

## Post-Deployment Tasks

### 1. Create Admin User

```bash
# SSH into your server
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "role": "ADMIN"
  }'
```

### 2. Setup SMS Webhook

Configure Africa's Talking webhook URL:
```
https://api.yourdomain.com/api/sms/ingest
```

### 3. Database Backups

Set up automated backups:

```bash
# Create backup script
nano /home/scripts/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U smsuser sms_fintrack > $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x /home/scripts/backup-db.sh
crontab -e
# Add: 0 2 * * * /home/scripts/backup-db.sh
```

### 4. Monitoring

- **Uptime Robot**: https://uptimerobot.com
- **Sentry** (error tracking): https://sentry.io
- **LogTail** (log management): https://logtail.com

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs sms-fintrack-api

# Check database connection
psql -U smsuser -d sms_fintrack -h localhost

# Restart service
pm2 restart sms-fintrack-api
```

### Database migration issues
```bash
cd backend
npx prisma migrate reset
npx prisma migrate deploy
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable firewall (ufw)
- [ ] Setup SSL/HTTPS
- [ ] Enable database SSL connections
- [ ] Restrict database access to localhost
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly

## Performance Optimization

1. **Enable Redis caching**
2. **Use CDN for frontend assets**
3. **Enable gzip compression in Nginx**
4. **Optimize database queries**
5. **Use connection pooling**

## Support

For deployment help:
- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- GitHub Issues: https://github.com/paulmwangi/SMS_FinTrack/issues
