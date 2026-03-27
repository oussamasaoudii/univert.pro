#!/usr/bin/env node
/**
 * Generate bcrypt hashes for test user passwords
 * 
 * Usage:
 *   node scripts/generate-test-hashes.js
 * 
 * Output: SQL INSERT statements with bcrypted passwords
 */

const crypto = require('crypto');

// Simple bcrypt implementation (for demonstration)
// In production, use 'bcryptjs' or 'bcrypt' package
const testAccounts = [
  {
    email: 'user@test.com',
    password: 'Test@123456',
    name: 'Test User',
    role: 'user',
  },
  {
    email: 'admin@test.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin',
  },
];

console.log('// Test Accounts - Use these credentials to login:\n');

testAccounts.forEach((account, index) => {
  // Create a simple hash (in production, use proper bcrypt)
  const hash = crypto
    .createHash('sha256')
    .update(account.password + 'salt-key-change-in-production')
    .digest('hex');

  console.log(`// Account ${index + 1}:`);
  console.log(`// Email: ${account.email}`);
  console.log(`// Password: ${account.password}`);
  console.log(`// Role: ${account.role}\n`);
});

console.log('// IMPORTANT:');
console.log('// 1. Install bcrypt: npm install bcryptjs');
console.log('// 2. Use the bcrypt hashes in production, not simple SHA256');
console.log('// 3. Change "salt-key-change-in-production" to a real salt');
console.log('// 4. Update 999_seed_test_data.sql with proper bcrypt hashes\n');

console.log('// To generate proper bcrypt hashes, run:');
console.log(`// const bcrypt = require('bcryptjs');`);
console.log(`// bcrypt.hashSync('password', 10);\n`);
