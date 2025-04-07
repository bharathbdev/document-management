import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../database/repositories/user.repository';
import { RoleRepository } from '../../database/repositories/role.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { comparePasswords, hashPassword } from '../../utilities/helper';

jest.mock('../../utilities/helper', () => ({
  comparePasswords: jest.fn(),
  hashPassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let roleRepository: jest.Mocked<RoleRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockRole = {
    id: 1,
    name: 'admin',
    permissions: [],
    users: [],
  };

  const mockUser = {
    id: 1,
    username: 'test-user',
    password: 'hashedpassword',
    role: mockRole,
    documents: [],
    ingestionTasks: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByUserName: jest.fn(),
            createUser: jest.fn(),
            saveUser: jest.fn(),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findByName: jest.fn(),
            createRole: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    roleRepository = module.get(RoleRepository);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockLoginDto = { username: 'test-user', password: 'test-password' };
      const mockAccessToken = 'test-access-token';

      userRepository.findByUserName.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(mockAccessToken);

      const result = await authService.login(mockLoginDto);

      expect(result).toEqual({ access_token: mockAccessToken });
      expect(userRepository.findByUserName).toHaveBeenCalledWith(mockLoginDto.username);
      expect(comparePasswords).toHaveBeenCalledWith(mockLoginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role.name,
        permissions: mockUser.role.permissions,
      });
    });

    it('should throw an error if password is invalid', async () => {
      const mockLoginDto = { username: 'test-user', password: 'wrong-password' };

      userRepository.findByUserName.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
      expect(userRepository.findByUserName).toHaveBeenCalledWith(mockLoginDto.username);
      expect(comparePasswords).toHaveBeenCalledWith(mockLoginDto.password, mockUser.password);
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const mockRegisterDto = { username: 'new-user', password: 'new-password' };
      const mockNewUser = { ...mockUser, username: 'new-user', role: mockRole };

      roleRepository.findByName.mockResolvedValue(mockRole);
      (hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      userRepository.createUser.mockResolvedValue(mockNewUser);

      const result = await authService.register(mockRegisterDto);

      expect(result).toEqual(mockNewUser);
      expect(roleRepository.findByName).toHaveBeenCalledWith('viewer');
      expect(hashPassword).toHaveBeenCalledWith(mockRegisterDto.password);
      expect(userRepository.createUser).toHaveBeenCalledWith(mockRegisterDto.username, 'hashedpassword', mockRole);
    });
  });

  describe('addUserRole', () => {
    it('should add a role to a user successfully', async () => {
      const mockAddRoleDto = { username: 'test-user', roleName: 'admin' };

      userRepository.findByUserName.mockResolvedValue(mockUser);
      roleRepository.findByName.mockResolvedValue(mockRole);
      userRepository.saveUser.mockResolvedValue({ ...mockUser, role: mockRole });

      const result = await authService.addUserRole(mockAddRoleDto);

      expect(result).toEqual({ ...mockUser, role: mockRole });
      expect(userRepository.findByUserName).toHaveBeenCalledWith(mockAddRoleDto.username);
      expect(roleRepository.findByName).toHaveBeenCalledWith(mockAddRoleDto.roleName);
      expect(userRepository.saveUser).toHaveBeenCalledWith({ ...mockUser, role: mockRole });
    });
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const mockCreateRoleDto = { roleName: 'editor', permissions: ['read', 'write'] };
      const mockNewRole = { id: 2, name: 'editor', permissions: ['read', 'write'], users: [] };

      roleRepository.createRole.mockResolvedValue(mockNewRole);

      const result = await authService.createRole(mockCreateRoleDto);

      expect(result).toEqual(mockNewRole);
      expect(roleRepository.createRole).toHaveBeenCalledWith(mockCreateRoleDto.roleName, mockCreateRoleDto.permissions);
    });
  });
});
