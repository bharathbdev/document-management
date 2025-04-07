import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            addUserRole: jest.fn(),
            createRole: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should login successfully', async () => {
      // Arrange
      const mockDto: LoginDto = {
        username: 'test-user',
        password: 'test-password',
      };
      const mockResponse = { access_token: 'test-token' };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.login(mockDto);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(mockDto);
    });

    it('should throw an error if login fails', async () => {
      // Arrange
      const mockDto: LoginDto = {
        username: 'test-user',
        password: 'wrong-password',
      };
      jest.spyOn(authService, 'login').mockRejectedValue(new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED));

      // Act & Assert
      await expect(controller.login(mockDto)).rejects.toThrow(HttpException);
      expect(authService.login).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      // Arrange
      const mockDto: RegisterDto = {
        username: 'new-user',
        password: 'new-password',
      };
      const mockUser = {
        id: 1,
        username: 'new-user',
        password: 'hashedpassword',
        role: {
          id: 1,
          name: 'viewer',
          permissions: [],
          users: [],
        },
        documents: [],
        ingestionTasks: [],
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockUser);

      // Act
      const result = await controller.register(mockDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.register).toHaveBeenCalledWith(mockDto);
    });

    it('should throw an error if registration fails', async () => {
      // Arrange
      const mockDto: RegisterDto = {
        username: 'new-user',
        password: 'new-password',
      };
      jest.spyOn(authService, 'register').mockRejectedValue(new HttpException('Registration failed', HttpStatus.BAD_REQUEST));

      // Act & Assert
      await expect(controller.register(mockDto)).rejects.toThrow(HttpException);
      expect(authService.register).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('addUserRole', () => {
    it('should add a role to a user successfully', async () => {
      // Arrange
      const mockDto = { username: 'test-user', roleName: 'admin' };
      const mockUser = {
        id: 1,
        username: 'test-user',
        password: 'hashedpassword',
        role: {
          id: 1,
          name: 'admin',
          permissions: [],
          users: [],
        },
        documents: [],
        ingestionTasks: [],
      };

      jest.spyOn(authService, 'addUserRole').mockResolvedValue(mockUser);

      // Act
      const result = await controller.addUserRole(mockDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(authService.addUserRole).toHaveBeenCalledWith(mockDto);
    });

    it('should throw an error if adding a role fails', async () => {
      // Arrange
      const mockDto = { username: 'test-user', roleName: 'admin' };
      jest.spyOn(authService, 'addUserRole').mockRejectedValue(new HttpException('Role assignment failed', HttpStatus.BAD_REQUEST));

      // Act & Assert
      await expect(controller.addUserRole(mockDto)).rejects.toThrow(HttpException);
      expect(authService.addUserRole).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      // Arrange
      const mockDto = { roleName: 'editor', permissions: ['read', 'write'] };
      const mockRole = {
        id: 1,
        name: 'editor',
        permissions: ['read', 'write'],
        users: [],
      };

      jest.spyOn(authService, 'createRole').mockResolvedValue(mockRole);

      // Act
      const result = await controller.createRole(mockDto);

      // Assert
      expect(result).toEqual(mockRole);
      expect(authService.createRole).toHaveBeenCalledWith(mockDto);
    });

    it('should throw an error if role creation fails', async () => {
      // Arrange
      const mockDto = { roleName: 'editor', permissions: ['read', 'write'] };
      jest.spyOn(authService, 'createRole').mockRejectedValue(new HttpException('Role creation failed', HttpStatus.BAD_REQUEST));

      // Act & Assert
      await expect(controller.createRole(mockDto)).rejects.toThrow(HttpException);
      expect(authService.createRole).toHaveBeenCalledWith(mockDto);
    });
  });
});
