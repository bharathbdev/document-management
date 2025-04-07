import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export interface IUserRepository {
  findByUserName(username: string): Promise<User>;
  createUser(username: string, password: string, role: Role): Promise<User>;
  saveUser(user: User): Promise<User>;
  findById(userId: number): Promise<User>;
}
