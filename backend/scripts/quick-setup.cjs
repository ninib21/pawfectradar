#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

function quickSetup() {
  log('\n🚀 PawfectRadar Quick Setup', 'bright');
  log('=====================================', 'cyan');

  // Generate secure secrets
  const secrets = {
    JWT_SECRET: generateSecret(64),
    QUANTUM_ENCRYPTION_KEY: generateSecret(32),
    QUANTUM_SIGNATURE_KEY: generateSecret(32),
    QUANTUM_ENV: 'production'
  };

  log('\n🔐 Generated secure secrets:', 'green');
  log(`   JWT_SECRET: ${secrets.JWT_SECRET.substring(0, 20)}...`, 'cyan');
  log(`   QUANTUM_ENCRYPTION_KEY: ${secrets.QUANTUM_ENCRYPTION_KEY.substring(0, 20)}...`, 'cyan');
  log(`   QUANTUM_SIGNATURE_KEY: ${secrets.QUANTUM_SIGNATURE_KEY.substring(0, 20)}...`, 'cyan');

  // Create environment content
  const envContent = `# PawfectRadar Production Environment
NODE_ENV=production
PORT=3001

# Database Configuration (UPDATE THESE VALUES)
DATABASE_URL="postgresql://username:password@host:port/database"
POSTGRES_HOST="your-database-host"
POSTGRES_PORT="5432"
POSTGRES_DB="pawfectradar_db"
POSTGRES_USER="your-database-username"
POSTGRES_PASSWORD="your-database-password"

# JWT Configuration
JWT_SECRET="${secrets.JWT_SECRET}"
JWT_EXPIRES_IN=7d

# Quantum Security
QUANTUM_ENCRYPTION_KEY="${secrets.QUANTUM_ENCRYPTION_KEY}"
QUANTUM_SIGNATURE_KEY="${secrets.QUANTUM_SIGNATURE_KEY}"
QUANTUM_ENV="${secrets.QUANTUM_ENV}"

# API Configuration (UPDATE THESE URLs)
API_BASE_URL="https://your-backend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"

# Optional Services (configure as needed)
# Email Configuration
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Payment Configuration
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# File Upload Configuration
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
`;

  // Write environment files
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
  const rootEnvPath = path.join(__dirname, '..', '.env');

  fs.writeFileSync(backendEnvPath, envContent);
  fs.writeFileSync(rootEnvPath, envContent);

  log('\n✅ Environment files created:', 'green');
  log(`   📁 Backend: ${backendEnvPath}`, 'cyan');
  log(`   📁 Root: ${rootEnvPath}`, 'cyan');

  // Create GitHub secrets guide
  const secretsGuide = `# GitHub Secrets for PawfectRadar

## Required Secrets to Add to GitHub:

### Database Secrets (UPDATE WITH YOUR VALUES):
DATABASE_URL="postgresql://username:password@host:port/database"

### Application Secrets:
JWT_SECRET="${secrets.JWT_SECRET}"
QUANTUM_ENCRYPTION_KEY="${secrets.QUANTUM_ENCRYPTION_KEY}"
QUANTUM_SIGNATURE_KEY="${secrets.QUANTUM_SIGNATURE_KEY}"
QUANTUM_ENV="${secrets.QUANTUM_ENV}"

### API Configuration (UPDATE WITH YOUR URLs):
API_BASE_URL="https://your-backend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"

## How to Add Secrets to GitHub:
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret above

## Deployment Platform Secrets (choose one):

### For Railway Backend:
RAILWAY_TOKEN="your-railway-token"
RAILWAY_PROJECT_ID="your-railway-project-id"

### For Vercel Frontend:
VERCEL_TOKEN="your-vercel-token"
VERCEL_PROJECT_ID="your-vercel-project-id"
VERCEL_ORG_ID="your-vercel-org-id"

## Next Steps:
1. Set up your database (Railway/Supabase)
2. Update DATABASE_URL with your connection string
3. Add all secrets to GitHub
4. Push code to trigger deployment
`;

  const secretsPath = path.join(__dirname, '..', 'GITHUB_SECRETS_SETUP.md');
  fs.writeFileSync(secretsPath, secretsGuide);

  log('✅ GitHub secrets guide created:', 'green');
  log(`   📁 ${secretsPath}`, 'cyan');

  // Create database setup instructions
  const dbSetupGuide = `# Quick Database Setup

## Option 1: Railway (Recommended - Free)
1. Go to https://railway.app
2. Sign in with GitHub
3. Create new project
4. Add PostgreSQL database
5. Copy connection string from Connect tab
6. Update DATABASE_URL in your .env files

## Option 2: Supabase (Alternative - Free)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Update DATABASE_URL in your .env files

## Option 3: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: pawfectradar_db
3. Update DATABASE_URL in your .env files

## After Database Setup:
1. Update DATABASE_URL in backend/.env and .env
2. Add DATABASE_URL to GitHub secrets
3. Push code to trigger deployment
`;

  const dbSetupPath = path.join(__dirname, '..', 'DATABASE_SETUP.md');
  fs.writeFileSync(dbSetupPath, dbSetupGuide);

  log('✅ Database setup guide created:', 'green');
  log(`   📁 ${dbSetupPath}`, 'cyan');

  // Final instructions
  log('\n🎉 Quick Setup Complete!', 'bright');
  log('=====================================', 'cyan');

  log('\n📋 Next Steps:', 'yellow');
  log('1. Set up your database (see DATABASE_SETUP.md)', 'cyan');
  log('2. Update DATABASE_URL in .env files', 'cyan');
  log('3. Add secrets to GitHub (see GITHUB_SECRETS_SETUP.md)', 'cyan');
  log('4. Push code to trigger deployment', 'cyan');

  log('\n📁 Generated Files:', 'yellow');
  log(`   📄 ${backendEnvPath}`, 'cyan');
  log(`   📄 ${rootEnvPath}`, 'cyan');
  log(`   📄 ${secretsPath}`, 'cyan');
  log(`   📄 ${dbSetupPath}`, 'cyan');

  log('\n🔒 Security Notes:', 'yellow');
  log('- Keep .env files secure and never commit them', 'red');
  log('- Use different secrets for production', 'red');
  log('- Enable SSL connections in production', 'red');

  log('\n🚀 Ready for deployment!', 'green');
}

quickSetup();
