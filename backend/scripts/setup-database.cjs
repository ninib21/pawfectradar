#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function setupDatabase() {
  log('\n🗄️  PawfectRadar Database Setup', 'bright');
  log('=====================================', 'cyan');

  log('\n📋 Database Setup Options:', 'yellow');
  log('1. Railway (Recommended - Free)', 'green');
  log('2. Supabase (Alternative - Free)', 'green');
  log('3. Local PostgreSQL', 'green');
  log('4. Manual Configuration', 'green');

  const choice = await question('\nSelect your database option (1-4): ');

  let databaseConfig = {};

  switch (choice) {
    case '1':
      log('\n🚂 Railway Setup Instructions:', 'bright');
      log('1. Go to https://railway.app', 'cyan');
      log('2. Sign in with GitHub', 'cyan');
      log('3. Create new project', 'cyan');
      log('4. Add PostgreSQL database', 'cyan');
      log('5. Get connection details from Connect tab', 'cyan');
      
      log('\n📝 Enter your Railway PostgreSQL connection details:', 'yellow');
      databaseConfig.host = await question('Host: ');
      databaseConfig.port = await question('Port (default 5432): ') || '5432';
      databaseConfig.database = await question('Database name: ');
      databaseConfig.username = await question('Username: ');
      databaseConfig.password = await question('Password: ');
      break;

    case '2':
      log('\n🔗 Supabase Setup Instructions:', 'bright');
      log('1. Go to https://supabase.com', 'cyan');
      log('2. Create new project', 'cyan');
      log('3. Go to Settings > Database', 'cyan');
      log('4. Copy connection string', 'cyan');
      
      const connectionString = await question('\nEnter your Supabase connection string: ');
      // Parse connection string
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

    case '4':
      log('\n⚙️  Manual Configuration:', 'bright');
      databaseConfig.host = await question('Host: ');
      databaseConfig.port = await question('Port: ');
      databaseConfig.database = await question('Database name: ');
      databaseConfig.username = await question('Username: ');
      databaseConfig.password = await question('Password: ');
      break;

    default:
      log('\n❌ Invalid choice. Please run the script again.', 'red');
      rl.close();
      return;
  }

  // Generate DATABASE_URL
  const databaseUrl = `postgresql://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;

  // Create environment file
  const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"
POSTGRES_HOST="${databaseConfig.host}"
POSTGRES_PORT="${databaseConfig.port}"
POSTGRES_DB="${databaseConfig.database}"
POSTGRES_USER="${databaseConfig.username}"
POSTGRES_PASSWORD="${databaseConfig.password}"

# Application Configuration
NODE_ENV=production
PORT=3001

# JWT Configuration
JWT_SECRET="${generateRandomString(64)}"
JWT_EXPIRES_IN=7d

# Quantum Security
QUANTUM_ENCRYPTION_KEY="${generateRandomString(32)}"
QUANTUM_SIGNATURE_KEY="${generateRandomString(32)}"

# API Configuration
API_BASE_URL="https://your-backend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"

# Email Configuration (Optional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Payment Configuration (Optional)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# File Upload (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
`;

  // Write to backend/.env
  const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');
  fs.writeFileSync(backendEnvPath, envContent);

  // Write to root .env for deployment
  const rootEnvPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(rootEnvPath, envContent);

  log('\n✅ Database configuration saved!', 'green');
  log(`📁 Backend .env: ${backendEnvPath}`, 'cyan');
  log(`📁 Root .env: ${rootEnvPath}`, 'cyan');

  log('\n🔒 Security Note:', 'yellow');
  log('- Keep your .env files secure and never commit them to git', 'yellow');
  log('- Use different passwords for production', 'yellow');
  log('- Enable SSL connections in production', 'yellow');

  log('\n📋 Next Steps:', 'bright');
  log('1. Test database connection', 'cyan');
  log('2. Run database migrations', 'cyan');
  log('3. Configure deployment secrets', 'cyan');
  log('4. Deploy your application', 'cyan');

  rl.close();
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setupDatabase().catch(error => {
  log(`\n💥 Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
