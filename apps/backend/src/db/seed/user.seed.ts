import dataSource from '../../ormconfig';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
import { userFactory } from '../factories/user.factory';
import { roleFactory } from '../factories/role.factory';

async function run() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  // --- Seed roles ---
  const roles = ['ADMIN', 'USER'];
  const roleEntities = roles.map(roleFactory);
  await roleRepo.upsert(roleEntities, ['name']);

  const adminRole = await roleRepo.findOneBy({ name: 'ADMIN' });
  const userRole = await roleRepo.findOneBy({ name: 'USER' });

  // --- Seed users ---
  // Admin (only 1)
  const admin = await userFactory({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@tasker.com',
    passwordHash: 'admin123',
  });
  admin.roles = [adminRole!];
  await userRepo.save(admin);

  // Test user
  const testUser = await userFactory({
    firstName: 'Test',
    lastName: 'User',
    email: 'user@tasker.com',
    passwordHash: 'user123',
  });
  testUser.roles = [userRole!];
  await userRepo.save(testUser);

  // Random users (all USER)
  const randomUsers = await Promise.all(
    Array.from({ length: 10 }, () => userFactory())
  );
  randomUsers.forEach((u) => (u.roles = [userRole!]));
  await userRepo.save(randomUsers);

  console.log('✅ Seeded 1 Admin, 1 Test User, 10 regular Users');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
