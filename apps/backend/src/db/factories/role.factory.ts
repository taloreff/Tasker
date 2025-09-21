import { Role } from '../../user/entities/role.entity';

export function roleFactory(name: string): Role {
  const role = new Role();
  role.name = name;
  return role;
}
