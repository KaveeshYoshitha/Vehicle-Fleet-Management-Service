import bcrypt from 'bcryptjs';

const passwords = {
  'admin123': await bcrypt.hash('admin123', 10),
  'password123': await bcrypt.hash('password123', 10),
};

console.log('Generated hashes:');
console.log('admin123:', passwords['admin123']);
console.log('password123:', passwords['password123']);
