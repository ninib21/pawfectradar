const { Client } = require('pg');

async function waitForDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 55432,
    database: 'pawfectradar_test',
    user: 'postgres',
    password: 'postgres',
  });

  let retries = 30;
  
  while (retries > 0) {
    try {
      await client.connect();
      console.log('✅ Database is ready!');
      await client.end();
      return;
    } catch (error) {
      console.log(`⏳ Waiting for database... (${retries} retries left)`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.error('❌ Database failed to start within 60 seconds');
  process.exit(1);
}

waitForDatabase();
