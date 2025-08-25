import dotenvFlow from 'dotenv-flow';

// Load test environment variables
dotenvFlow.config({ node_env: 'test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.TEST_PORT || '0'; // random port

console.log('🧪 Test environment loaded');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${process.env.PORT}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`);
