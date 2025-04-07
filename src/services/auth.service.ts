import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../database/repositories/user.repository';
import { RoleRepository } from '../database/repositories/role.repository';
import { Login, Register, AddRole, CreateRole, LoginResponse } from '../types/auth.type';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { hashPassword, comparePasswords } from '../utilities/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async login(login: Login): Promise<LoginResponse> {
    const user = await this.userRepository.findByUserName(login.username);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePasswords(login.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role.name,
      permissions: user.role.permissions,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(register: Register): Promise<User> {
    const role = await this.roleRepository.findByName('viewer');
    if (!role) {
      throw new HttpException('Default role "viewer" not found', HttpStatus.CONFLICT);
    }

    const hashedPassword = await hashPassword(register.password);
    return this.userRepository.createUser(register.username, hashedPassword, role);
  }

  async addUserRole(addRole: AddRole): Promise<User> {
    const user = await this.userRepository.findByUserName(addRole.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const role = await this.roleRepository.findByName(addRole.roleName);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    user.role = role;
    return this.userRepository.saveUser(user);
  }

  async createRole(createRole: CreateRole): Promise<Role> {
    return this.roleRepository.createRole(createRole.roleName, createRole.permissions);
  }
}
