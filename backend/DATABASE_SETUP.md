# Quick Database Setup

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
