import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findByName(name: string): Promise<Role>;
  createRole(name: string, permissions: string[]): Promise<Role>;
}
