import { faker } from '@faker-js/faker'
import { User } from '../../user/entities/user.entity';

export async function userFactory(overrides: Partial<User> = {}): Promise<User> {
  const user = new User();
  user.firstName = faker.name.firstName();
  user.lastName = faker.name.lastName();
  user.email = faker.internet.email();
  user.passwordHash = 'password123';
  Object.assign(user, overrides);
  return user;
}
