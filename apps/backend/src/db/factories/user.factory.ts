import { faker } from '@faker-js/faker'
import { User } from '../../user/entities/user.entity';

export async function userFactory(overrides: Partial<User> = {}): Promise<User> {
  const user = new User();
  user.name = faker.name.fullName();
  user.email = faker.internet.email();
  user.passwordHash = 'password123';
  Object.assign(user, overrides);
  return user;
}
