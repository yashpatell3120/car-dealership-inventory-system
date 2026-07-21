import { getDb } from './connection';
import { createUser, findUserByEmail } from './userRepository';
import { createVehicle } from './vehicleRepository';
import { hashPassword } from '../utils/auth';

async function seed() {
  getDb(); // ensures schema exists

  if (!findUserByEmail('admin@dealership.com')) {
    const hash = await hashPassword('AdminPass123');
    createUser('admin@dealership.com', hash, 'admin');
    console.log('Created admin user: admin@dealership.com / AdminPass123');
  }

  if (!findUserByEmail('user@dealership.com')) {
    const hash = await hashPassword('UserPass123');
    createUser('user@dealership.com', hash, 'user');
    console.log('Created regular user: user@dealership.com / UserPass123');
  }

  const sampleVehicles = [
    { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 28500, quantity: 5 },
    { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32900, quantity: 3 },
    { make: 'Honda', model: 'Civic', category: 'Sedan', price: 24500, quantity: 7 },
    { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 2 },
    { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 41000, quantity: 4 },
    { make: 'Chevrolet', model: 'Corvette', category: 'Sports', price: 68000, quantity: 0 },
    { make: 'BMW', model: 'X5', category: 'SUV', price: 61500, quantity: 1 },
    { make: 'Mazda', model: 'CX-5', category: 'SUV', price: 29800, quantity: 6 },
  ];

  for (const v of sampleVehicles) {
    createVehicle(v);
  }

  console.log(`Seeded ${sampleVehicles.length} vehicles.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
