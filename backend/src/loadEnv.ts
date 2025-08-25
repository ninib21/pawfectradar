/**
 * Safe env bootstrap that does NOT rely on .env files.
 * Provides sane defaults for dev/test DB so the app connects even if .env is blocked.
 */
const isTest = process.env.NODE_ENV === 'test';

function setIfMissing(key: string, val: string) {
  if (!process.env[key] || process.env[key] === '') process.env[key] = val;
}

if (isTest) {
  setIfMissing('TEST_DB_HOST', '127.0.0.1');
  setIfMissing('TEST_DB_PORT', '55432');
  setIfMissing('TEST_DB_USER', 'postgres');
  setIfMissing('TEST_DB_PASS', 'postgres');
  setIfMissing('TEST_DB_NAME', 'pawfectradar_test');
} else {
  setIfMissing('DB_HOST', '127.0.0.1');
  setIfMissing('DB_PORT', '5434');
  setIfMissing('DB_USER', 'postgres');
  setIfMissing('DB_PASS', 'postgres');
  setIfMissing('DB_NAME', 'pawfectradar_dev');
}

// Derive Prisma DATABASE_URL if missing
const host = isTest ? process.env.TEST_DB_HOST : process.env.DB_HOST;
const port = isTest ? process.env.TEST_DB_PORT : process.env.DB_PORT;
const user = isTest ? process.env.TEST_DB_USER : process.env.DB_USER;
const pass = isTest ? process.env.TEST_DB_PASS : process.env.DB_PASS;
const dbName = isTest ? process.env.TEST_DB_NAME : process.env.DB_NAME;

function enc(v?: string) { return encodeURIComponent(v ?? ''); }
const pgUrl = `postgresql://${user}:${enc(pass)}@${host}:${port}/${dbName}?schema=public`;

if (isTest) {
  if (!process.env.TEST_DATABASE_URL) process.env.TEST_DATABASE_URL = pgUrl;
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;
} else {
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = pgUrl;
}
