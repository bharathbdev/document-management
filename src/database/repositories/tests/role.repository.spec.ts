import { RoleRepository } from '../role.repository';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('RoleRepository', () => {
  let roleRepository: RoleRepository;
  let mockRoleRepository: jest.Mocked<Repository<Role>>;

  beforeEach(async () => {
    mockRoleRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Role>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  describe('findByName', () => {
    it('should return a role if it exists', async () => {
      const mockRole = {
        id: 1,
        name: 'admin',
        permissions: ['read', 'write'],
      } as Role;
      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await roleRepository.findByName('admin');

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'admin' },
      });
    });

    it('should throw a NotFoundException if the role does not exist', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(roleRepository.findByName('nonexistent')).rejects.toThrow(
        new NotFoundException('Role with name "nonexistent" not found'),
      );
    });
  });

  describe('createRole', () => {
    it('should create and return a new role', async () => {
      const mockRole = { id: 1, name: 'editor', permissions: ['read'] } as Role;
      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await roleRepository.createRole('editor', ['read']);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'editor',
        permissions: ['read'],
      });
      expect(mockRoleRepository.save).toHaveBeenCalledWith(mockRole);
    });
  });
});
