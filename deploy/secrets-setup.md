# 🔐 Deployment Secrets Configuration Guide

## GitHub Secrets Setup

### Required Secrets for PawfectRadar Deployment

#### 1. Database Secrets
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
POSTGRES_HOST="your-database-host"
POSTGRES_PORT="5432"
POSTGRES_DB="pawfectradar_db"
POSTGRES_USER="your-database-username"
POSTGRES_PASSWORD="your-database-password"
```

#### 2. Application Secrets
```bash
NODE_ENV="production"
PORT="3001"
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"
```

#### 3. Quantum Security Secrets
```bash
QUANTUM_ENCRYPTION_KEY="your-quantum-encryption-key"
QUANTUM_SIGNATURE_KEY="your-quantum-signature-key"
QUANTUM_ENV="production"
```

#### 4. API Configuration
```bash
API_BASE_URL="https://your-backend-domain.com"
FRONTEND_URL="https://your-frontend-domain.com"
```

#### 5. Deployment Platform Secrets

##### For Railway Backend:
```bash
RAILWAY_TOKEN="your-railway-token"
RAILWAY_PROJECT_ID="your-railway-project-id"
```

##### For Vercel Frontend:
```bash
VERCEL_TOKEN="your-vercel-token"
VERCEL_PROJECT_ID="your-vercel-project-id"
VERCEL_ORG_ID="your-vercel-org-id"
```

#### 6. Optional Services

##### Email (SMTP):
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

##### Payment (Stripe):
```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

##### File Upload (AWS S3):
```bash
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"
```

## How to Add GitHub Secrets

### Step 1: Go to Your GitHub Repository
1. Navigate to your repository on GitHub
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"

### Step 2: Add Each Secret
1. Click "New repository secret"
2. Enter the secret name (e.g., `DATABASE_URL`)
3. Enter the secret value
4. Click "Add secret"

### Step 3: Required Secrets List

#### Essential Secrets (Required):
- `DATABASE_URL`
- `JWT_SECRET`
- `QUANTUM_ENCRYPTION_KEY`
- `QUANTUM_SIGNATURE_KEY`
- `API_BASE_URL`
- `FRONTEND_URL`

#### Platform Secrets (Choose your deployment platform):
- `RAILWAY_TOKEN` + `RAILWAY_PROJECT_ID` (for Railway)
- `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` + `VERCEL_ORG_ID` (for Vercel)

#### Optional Secrets:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (for email)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (for payments)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` (for file uploads)

## Security Best Practices

### 1. Generate Strong Secrets
```bash
# Generate JWT Secret
openssl rand -base64 64

# Generate Quantum Keys
openssl rand -base64 32
```

### 2. Use Different Secrets for Different Environments
- Development: Use local `.env` files
- Staging: Use staging-specific secrets
- Production: Use production-specific secrets

### 3. Rotate Secrets Regularly
- Change JWT secrets monthly
- Rotate API keys quarterly
- Update database passwords regularly

### 4. Monitor Secret Usage
- Enable GitHub security alerts
- Monitor for secret leaks
- Use secret scanning tools

## Quick Setup Script

Run the database setup script first:
```bash
node scripts/setup-database.js
```

Then manually add the remaining secrets to GitHub.

## Verification

After adding secrets, you can verify them by:
1. Running the CI/CD pipeline
2. Checking deployment logs
3. Testing the deployed application

## Troubleshooting

### Common Issues:
1. **Secret not found**: Double-check secret names match exactly
2. **Invalid format**: Ensure secrets are properly formatted
3. **Permission denied**: Check repository permissions
4. **Deployment fails**: Review CI/CD logs for specific errors

### Debug Commands:
```bash
# Test database connection
npx prisma db push

# Test environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Check secret access in CI
echo "Testing secret access..."
```
