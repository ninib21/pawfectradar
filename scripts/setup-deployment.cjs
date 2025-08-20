#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

async function setupDeployment() {
  log('\n🚀 PawfectRadar Deployment Setup', 'bright');
  log('=====================================', 'cyan');

  log('\n📋 This script will help you set up:', 'yellow');
  log('1. Database configuration', 'cyan');
  log('2. Generate secure secrets', 'cyan');
  log('3. Create deployment files', 'cyan');
  log('4. Guide you through GitHub secrets setup', 'cyan');

  const proceed = await question('\nContinue with setup? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    log('\n❌ Setup cancelled.', 'red');
    rl.close();
    return;
  }

  // Step 1: Database Setup
  log('\n🗄️  Step 1: Database Configuration', 'bright');
  log('----------------------------------------', 'cyan');

  log('\n📋 Choose your database provider:', 'yellow');
  log('1. Railway (Recommended - Free)', 'green');
  log('2. Supabase (Alternative - Free)', 'green');
  log('3. Local PostgreSQL (Development)', 'green');
  log('4. Skip for now (configure later)', 'green');

  const dbChoice = await question('\nSelect database option (1-4): ');

  let databaseConfig = {};

  if (dbChoice !== '4') {
    switch (dbChoice) {
      case '1':
        log('\n🚂 Railway Setup:', 'bright');
        log('1. Go to https://railway.app', 'cyan');
        log('2. Sign in with GitHub', 'cyan');
        log('3. Create new project', 'cyan');
        log('4. Add PostgreSQL database', 'cyan');
        log('5. Get connection details from Connect tab', 'cyan');
        
        databaseConfig.host = await question('\nHost: ');
        databaseConfig.port = await question('Port (default 5432): ') || '5432';
        databaseConfig.database = await question('Database name: ');
        databaseConfig.username = await question('Username: ');
        databaseConfig.password = await question('Password: ');
        break;

      case '2':
        log('\n🔗 Supabase Setup:', 'bright');
        log('1. Go to https://supabase.com', 'cyan');
        log('2. Create new project', 'cyan');
        log('3. Go to Settings > Database', 'cyan');
        log('4. Copy connection string', 'cyan');
        
        const connectionString = await question('\nConnection string: ');
        const url = new URL(connectionString);
        databaseConfig.host = url.hostname;
        databaseConfig.port = url.port || '5432';
        databaseConfig.database = url.pathname.slice(1);
        databaseConfig.username = url.username;
        databaseConfig.password = url.password;
        break;

      case '3':
        log('\n💻 Local PostgreSQL Setup:', 'bright');
        databaseConfig.host = await question('Host (default localhost): ') || 'localhost';
        databaseConfig.port = await question('Port (default 5432): ') || '5432';
        databaseConfig.database = await question('Database name (default pawfectradar_db): ') || 'pawfectradar_db';
        databaseConfig.username = await question('Username: ');
        databaseConfig.password = await question('Password: ');
        break;

      default:
        log('\n❌ Invalid choice. Skipping database setup.', 'red');
        break;
    }
  }

  // Step 2: Generate Secrets
  log('\n🔐 Step 2: Generating Secure Secrets', 'bright');
  log('----------------------------------------', 'cyan');

  const secrets = {
    JWT_SECRET: generateSecret(64),
    QUANTUM_ENCRYPTION_KEY: generateSecret(32),
    QUANTUM_SIGNATURE_KEY: generateSecret(32),
    QUANTUM_ENV: 'production'
  };

  log('✅ Generated secure secrets:', 'green');
  log(`   JWT_SECRET: ${secrets.JWT_SECRET.substring(0, 20)}...`, 'cyan');
  log(`   QUANTUM_ENCRYPTION_KEY: ${secrets.QUANTUM_ENCRYPTION_KEY.substring(0, 20)}...`, 'cyan');
  log(`   QUANTUM_SIGNATURE_KEY: ${secrets.QUANTUM_SIGNATURE_KEY.substring(0, 20)}...`, 'cyan');

  // Step 3: Deployment URLs
  log('\n🌐 Step 3: Deployment URLs', 'bright');
  log('----------------------------------------', 'cyan');

  const apiUrl = await question('Backend API URL (e.g., https://your-app.railway.app): ');
  const frontendUrl = await question('Frontend URL (e.g., https://your-app.vercel.app): ');

  // Step 4: Create Environment Files
  log('\n📁 Step 4: Creating Environment Files', 'bright');
  log('----------------------------------------', 'cyan');

  let envContent = `# PawfectRadar Production Environment
NODE_ENV=production
PORT=3001

# Database Configuration
`;

  if (Object.keys(databaseConfig).length > 0) {
    const databaseUrl = `postgresql://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;
    envContent += `DATABASE_URL="${databaseUrl}"
POSTGRES_HOST="${databaseConfig.host}"
POSTGRES_PORT="${databaseConfig.port}"
POSTGRES_DB="${databaseConfig.database}"
POSTGRES_USER="${databaseConfig.username}"
POSTGRES_PASSWORD="${databaseConfig.password}"

`;
  } else {
    envContent += `DATABASE_URL="your-database-url-here"
POSTGRES_HOST="your-host"
POSTGRES_PORT="5432"
POSTGRES_DB="pawfectradar_db"
POSTGRES_USER="your-username"
POSTGRES_PASSWORD="your-password"

`;
  }

  envContent += `# JWT Configuration
JWT_SECRET="${secrets.JWT_SECRET}"
JWT_EXPIRES_IN=7d

# Quantum Security
QUANTUM_ENCRYPTION_KEY="${secrets.QUANTUM_ENCRYPTION_KEY}"
QUANTUM_SIGNATURE_KEY="${secrets.QUANTUM_SIGNATURE_KEY}"
QUANTUM_ENV="${secrets.QUANTUM_ENV}"

# API Configuration
API_BASE_URL="${apiUrl}"
FRONTEND_URL="${frontendUrl}"

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

  log('✅ Environment files created:', 'green');
  log(`   📁 Backend: ${backendEnvPath}`, 'cyan');
  log(`   📁 Root: ${rootEnvPath}`, 'cyan');

  // Step 5: Create GitHub Secrets Guide
  log('\n🔑 Step 5: GitHub Secrets Setup Guide', 'bright');
  log('----------------------------------------', 'cyan');

  const secretsGuide = `# GitHub Secrets for PawfectRadar

## Required Secrets to Add:

### Database Secrets:
DATABASE_URL="${Object.keys(databaseConfig).length > 0 ? `postgresql://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}` : 'your-database-url-here'}"

### Application Secrets:
JWT_SECRET="${secrets.JWT_SECRET}"
QUANTUM_ENCRYPTION_KEY="${secrets.QUANTUM_ENCRYPTION_KEY}"
QUANTUM_SIGNATURE_KEY="${secrets.QUANTUM_SIGNATURE_KEY}"
QUANTUM_ENV="${secrets.QUANTUM_ENV}"

### API Configuration:
API_BASE_URL="${apiUrl}"
FRONTEND_URL="${frontendUrl}"

## How to Add Secrets:
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
1. Add these secrets to GitHub
2. Push your code to trigger deployment
3. Monitor the deployment in GitHub Actions
`;

  const secretsPath = path.join(__dirname, '..', 'GITHUB_SECRETS_SETUP.md');
  fs.writeFileSync(secretsPath, secretsGuide);

  log('✅ GitHub secrets guide created:', 'green');
  log(`   📁 ${secretsPath}`, 'cyan');

  // Final Instructions
  log('\n🎉 Setup Complete!', 'bright');
  log('=====================================', 'cyan');

  log('\n📋 Next Steps:', 'yellow');
  log('1. Review the generated files', 'cyan');
  log('2. Add secrets to GitHub repository', 'cyan');
  log('3. Set up your database (if not done)', 'cyan');
  log('4. Push code to trigger deployment', 'cyan');

  log('\n📁 Generated Files:', 'yellow');
  log(`   📄 ${backendEnvPath}`, 'cyan');
  log(`   📄 ${rootEnvPath}`, 'cyan');
  log(`   📄 ${secretsPath}`, 'cyan');

  log('\n🔒 Security Notes:', 'yellow');
  log('- Keep .env files secure and never commit them', 'red');
  log('- Use different secrets for production', 'red');
  log('- Enable SSL connections in production', 'red');

  log('\n🚀 Ready for deployment!', 'green');

  rl.close();
}

setupDeployment().catch(error => {
  log(`\n💥 Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
