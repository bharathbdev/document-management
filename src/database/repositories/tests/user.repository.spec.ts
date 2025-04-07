import { UserRepository } from '../user.repository';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('findByUserName', () => {
    it('should return a user if the username exists', async () => {
      const mockUser = {
        id: 1,
        username: 'test-user',
        role: { name: 'admin' },
      } as User;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByUserName('test-user');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'test-user' },
        relations: ['role'],
      });
    });

    it('should throw a NotFoundException if the username does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userRepository.findByUserName('nonexistent-user')).rejects.toThrow(
        new NotFoundException('User with username "nonexistent-user" not found'),
      );
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const mockRole = { id: 1, name: 'admin' } as Role;
      const mockUser = {
        id: 1,
        username: 'test-user',
        password: 'hashedpassword',
        role: mockRole,
      } as User;

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await userRepository.createUser('test-user', 'hashedpassword', mockRole);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'test-user',
        password: 'hashedpassword',
        role: mockRole,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('saveUser', () => {
    it('should save and return the user', async () => {
      const mockUser = {
        id: 1,
        username: 'test-user',
        password: 'hashedpassword',
      } as User;

      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await userRepository.saveUser(mockUser);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user if the ID exists', async () => {
      const mockUser = {
        id: 1,
        username: 'test-user',
        role: { name: 'admin' },
      } as User;
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['role'],
      });
    });

    it('should throw a NotFoundException if the ID does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userRepository.findById(999)).rejects.toThrow(new NotFoundException('User with ID "999" not found'));
    });
  });
});
