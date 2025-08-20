# 🚀 Quantum Pawfect Sitters - Production Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the Quantum Pawfect Sitters application to production, including all AI services, database setup, SSL configuration, and monitoring.

## 🎯 Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ or CentOS 8+
- **CPU**: 8+ cores (16+ recommended for AI workloads)
- **RAM**: 16GB+ (32GB+ recommended for AI workloads)
- **Storage**: 100GB+ SSD storage
- **Network**: Stable internet connection with static IP

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18.x+
- **PostgreSQL**: 15+
- **Redis**: 7+
- **Nginx**: 1.20+

### Domain & SSL
- **Domain**: `quantum-pawfectsitters.com` (or your custom domain)
- **AI Subdomain**: `ai.quantum-pawfectsitters.com`
- **SSL Certificates**: Let's Encrypt (automatic) or custom certificates

## 🔧 Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

### 1.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.3 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm --version
```

### 1.4 Install PostgreSQL Client
```bash
sudo apt install -y postgresql-client
```

## 🔐 Step 2: Environment Configuration

### 2.1 Clone Repository
```bash
git clone https://github.com/your-org/pawfect-sitters.git
cd pawfect-sitters
```

### 2.2 Configure Environment Variables

#### Main Application Environment
```bash
cp deploy/quantum.env.example deploy/quantum.env
nano deploy/quantum.env
```

**Required Variables:**
```env
# Database
QUANTUM_DATABASE_URL=postgresql://user:password@host:5432/database
QUANTUM_DB_PASSWORD=your_secure_password

# Redis
QUANTUM_REDIS_PASSWORD=your_redis_password

# JWT
QUANTUM_JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
QUANTUM_SMTP_HOST=smtp.your-provider.com
QUANTUM_SMTP_USER=your_email
QUANTUM_SMTP_PASSWORD=your_password
```

#### AI Services Environment
```bash
cp deploy/ai.env.example deploy/ai.env
nano deploy/ai.env
```

**Required Variables:**
```env
# OpenAI
OPENAI_API_KEY=sk-...

# AI Database
QUANTUM_AI_DATABASE_URL=postgresql://ai_user:password@host:5432/quantum_ai
QUANTUM_AI_DB_PASSWORD=your_ai_db_password

# AI Redis
QUANTUM_AI_REDIS_PASSWORD=your_ai_redis_password

# AI API
AI_API_KEY=your_ai_api_key
```

## 🗄️ Step 3: Database Setup

### 3.1 Set Up PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create databases
sudo -u postgres psql -c "CREATE DATABASE quantum_pawfectsitters;"
sudo -u postgres psql -c "CREATE DATABASE quantum_ai;"
sudo -u postgres psql -c "CREATE USER quantum_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE USER quantum_ai_user WITH PASSWORD 'your_ai_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE quantum_pawfectsitters TO quantum_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE quantum_ai TO quantum_ai_user;"
```

### 3.2 Run Database Migrations
```bash
# Make migration script executable
chmod +x deploy/scripts/database-migration.sh

# Run migrations
./deploy/scripts/database-migration.sh
```

## 🔒 Step 4: SSL Configuration

### 4.1 Set Up Domain DNS
Configure your domain DNS to point to your server:
- `A` record: `quantum-pawfectsitters.com` → Your server IP
- `A` record: `ai.quantum-pawfectsitters.com` → Your server IP

### 4.2 Configure SSL
```bash
# Make SSL setup script executable
chmod +x deploy/scripts/setup-ssl.sh

# Set environment variables
export DOMAIN=quantum-pawfectsitters.com
export AI_DOMAIN=ai.quantum-pawfectsitters.com
export EMAIL=admin@quantum-pawfectsitters.com
export ENVIRONMENT=production

# Run SSL setup
./deploy/scripts/setup-ssl.sh
```

## 🧠 Step 5: AI Services Deployment

### 5.1 Build AI Services
```bash
# Navigate to AI directory
cd ai

# Install dependencies
npm install

# Build AI services
npm run build
```

### 5.2 Deploy AI Services
```bash
# Make deployment script executable
chmod +x deploy/scripts/deploy-ai-production.sh

# Set environment variables
export ENVIRONMENT=production
export OPENAI_API_KEY=your_openai_api_key

# Deploy AI services
./deploy/scripts/deploy-ai-production.sh
```

## 🚀 Step 6: Main Application Deployment

### 6.1 Build Application
```bash
# Build backend
cd backend
npm install
npm run build

# Build frontend
cd ../frontend
npm install
npm run build
```

### 6.2 Deploy with Docker Compose
```bash
# Navigate to deploy directory
cd ../deploy

# Start main services
docker-compose up -d

# Start AI services
docker-compose -f docker-compose.ai.yml up -d

# Check service status
docker-compose ps
docker-compose -f docker-compose.ai.yml ps
```

## 📊 Step 7: Monitoring Setup

### 7.1 Set Up Prometheus & Grafana
```bash
# Navigate to monitoring directory
cd quantum-monitoring

# Start monitoring stack
docker-compose up -d

# Access Grafana
# URL: http://your-server-ip:3000
# Default credentials: admin/admin
```

### 7.2 Configure Alerts
1. Access Grafana dashboard
2. Import dashboards for:
   - Application metrics
   - AI service metrics
   - Database metrics
   - System metrics

## 🔍 Step 8: Health Checks

### 8.1 Verify Services
```bash
# Check main application
curl -f https://quantum-pawfectsitters.com/health

# Check AI services
curl -f https://ai.quantum-pawfectsitters.com/health

# Check database connectivity
psql $QUANTUM_DATABASE_URL -c "SELECT 1;"
psql $QUANTUM_AI_DATABASE_URL -c "SELECT 1;"
```

### 8.2 Test AI Features
```bash
# Test trust score calculation
curl -X POST https://ai.quantum-pawfectsitters.com/trust-score \
  -H "Content-Type: application/json" \
  -d '{"sitterId": "test-sitter-id"}'

# Test sentiment analysis
curl -X POST https://ai.quantum-pawfectsitters.com/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Great service, highly recommended!"}'
```

## 🔄 Step 9: CI/CD Pipeline

### 9.1 Configure GitHub Actions
1. Add secrets to your GitHub repository:
   - `OPENAI_API_KEY`
   - `QUANTUM_DATABASE_URL`
   - `QUANTUM_AI_DATABASE_URL`
   - `DEPLOY_SSH_KEY`
   - `DEPLOY_HOST`

2. Push to main branch to trigger deployment:
```bash
git add .
git commit -m "Production deployment"
git push origin main
```

## 🛡️ Step 10: Security Hardening

### 10.1 Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw allow 3002
sudo ufw enable
```

### 10.2 Security Headers
Verify security headers are properly configured in nginx:
```bash
curl -I https://quantum-pawfectsitters.com
```

### 10.3 Regular Updates
Set up automatic security updates:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 Step 11: Performance Optimization

### 11.1 Database Optimization
```sql
-- Run in PostgreSQL
ANALYZE;
VACUUM;
REINDEX DATABASE quantum_pawfectsitters;
REINDEX DATABASE quantum_ai;
```

### 11.2 Cache Configuration
Verify Redis is properly configured for caching:
```bash
redis-cli ping
redis-cli info memory
```

### 11.3 Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 1000 -c 10 https://quantum-pawfectsitters.com/api/health
```

## 🔧 Step 12: Backup Strategy

### 12.1 Database Backups
```bash
# Create backup script
cat > /etc/cron.daily/quantum-backup << 'EOF'
#!/bin/bash
/opt/pawfect-sitters/deploy/scripts/database-migration.sh
EOF

chmod +x /etc/cron.daily/quantum-backup
```

### 12.2 File Backups
```bash
# Backup configuration files
tar -czf /backups/config-$(date +%Y%m%d).tar.gz /opt/pawfect-sitters/deploy/*.env
```

## 🚨 Step 13: Troubleshooting

### Common Issues

#### AI Services Not Starting
```bash
# Check AI service logs
docker-compose -f docker-compose.ai.yml logs quantum-ai-service

# Verify OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

#### Database Connection Issues
```bash
# Check database connectivity
psql $QUANTUM_DATABASE_URL -c "SELECT version();"

# Check database logs
docker-compose logs quantum-postgres
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificates manually
certbot renew --dry-run
```

## 📞 Step 14: Support & Maintenance

### 14.1 Monitoring Dashboard
- **Grafana**: http://your-server-ip:3000
- **Prometheus**: http://your-server-ip:9090
- **Application**: https://quantum-pawfectsitters.com

### 14.2 Log Locations
```bash
# Application logs
docker-compose logs -f

# AI service logs
docker-compose -f docker-compose.ai.yml logs -f

# System logs
sudo journalctl -u docker
sudo journalctl -u nginx
```

### 14.3 Update Procedures
```bash
# Update application
git pull origin main
docker-compose down
docker-compose up -d --build

# Update AI services
cd ai
git pull origin main
./deploy/scripts/deploy-ai-production.sh
```

## ✅ Deployment Checklist

- [ ] Server setup completed
- [ ] Environment variables configured
- [ ] Database setup and migrations run
- [ ] SSL certificates obtained
- [ ] AI services deployed
- [ ] Main application deployed
- [ ] Monitoring configured
- [ ] Health checks passed
- [ ] CI/CD pipeline configured
- [ ] Security hardening applied
- [ ] Performance optimized
- [ ] Backup strategy implemented
- [ ] Documentation updated

## 🎉 Success!

Your Quantum Pawfect Sitters application is now deployed to production with:
- ✅ AI-powered features (Trust Score, Matchmaking, Sentiment Analysis, Smart Booking)
- ✅ Military-grade security
- ✅ High availability and scalability
- ✅ Comprehensive monitoring
- ✅ Automated backups
- ✅ SSL encryption

**Production URLs:**
- **Main Application**: https://quantum-pawfectsitters.com
- **AI Services**: https://ai.quantum-pawfectsitters.com
- **Monitoring**: http://your-server-ip:3000 (Grafana)

For support and maintenance, refer to the troubleshooting section or contact the development team.
