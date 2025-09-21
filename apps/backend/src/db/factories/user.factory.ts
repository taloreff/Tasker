
import { User } from '../../user/entities/user.entity';

export async function userFactory(overrides: Partial<User> = {}): Promise<User> {
  const { faker } = await import('@faker-js/faker');
  const user = new User();
  user.name = faker.person.fullName();
  user.email = faker.internet.email();
  user.passwordHash = 'password123';
  Object.assign(user, overrides);
  return user;
}
