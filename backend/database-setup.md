# 🗄️ Database Setup Guide

## PostgreSQL Database Setup

### Option 1: Railway (Recommended - Free Tier)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL database
5. Get connection details

### Option 2: Supabase (Alternative - Free Tier)
1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Use built-in PostgreSQL
4. Get connection string

### Option 3: Local PostgreSQL (Development)
1. Install PostgreSQL locally
2. Create database: `pawfectradar_db`
3. Use local connection

## Database Connection Details

### Environment Variables Needed:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
POSTGRES_HOST="your-host"
POSTGRES_PORT="5432"
POSTGRES_DB="pawfectradar_db"
POSTGRES_USER="your-username"
POSTGRES_PASSWORD="your-password"
```

### Railway Setup Steps:
1. **Create Railway Account**
   - Visit: https://railway.app
   - Sign in with GitHub
   - Create new project

2. **Add PostgreSQL Database**
   - Click "New Service"
   - Select "Database" → "PostgreSQL"
   - Wait for provisioning

3. **Get Connection Details**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy connection string

4. **Database Migration**
   - Run: `npx prisma migrate deploy`
   - Run: `npx prisma generate`

## Security Considerations
- Use strong passwords
- Enable SSL connections
- Set up connection pooling
- Regular backups
- Monitor usage

## Next Steps
1. Set up database
2. Configure environment variables
3. Run migrations
4. Test connection
5. Deploy application
