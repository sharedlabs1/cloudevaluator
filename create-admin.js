const bcrypt = require('bcryptjs');

async function createHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password hash for admin123:', hash);
  
  console.log('\nSQL to update admin user:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@example.com';`);
}

createHash();