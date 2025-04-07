import { IngestionTaskRepository } from '../ingestionTask.repository';
import { Repository } from 'typeorm';
import { IngestionTask } from '../../entities/ingestion-task.entity';
import { User } from '../../entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('IngestionTaskRepository', () => {
  let ingestionTaskRepository: IngestionTaskRepository;
  let mockIngestionTaskRepository: jest.Mocked<Repository<IngestionTask>>;

  beforeEach(async () => {
    mockIngestionTaskRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<IngestionTask>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionTaskRepository,
        {
          provide: getRepositoryToken(IngestionTask),
          useValue: mockIngestionTaskRepository,
        },
      ],
    }).compile();

    ingestionTaskRepository = module.get<IngestionTaskRepository>(IngestionTaskRepository);
  });

  describe('createTask', () => {
    it('should create and save a new ingestion task', async () => {
      const mockUser = { id: 1, username: 'test-user' } as User;
      const mockIngestionInput = { data: 'test-data' };
      const mockTask = {
        id: 1,
        status: 'IN_PROGRESS',
        ingestionInput: mockIngestionInput,
        createdAt: new Date(),
        user: mockUser,
      } as IngestionTask;

      mockIngestionTaskRepository.create.mockReturnValue(mockTask);
      mockIngestionTaskRepository.save.mockResolvedValue(mockTask);

      const result = await ingestionTaskRepository.createTask(1, 'IN_PROGRESS', mockIngestionInput, mockUser);

      expect(result).toEqual(mockTask);
      expect(mockIngestionTaskRepository.create).toHaveBeenCalledWith({
        id: 1,
        status: 'IN_PROGRESS',
        ingestionInput: mockIngestionInput,
        createdAt: expect.any(Date),
        user: mockUser,
      });
      expect(mockIngestionTaskRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update the status of an existing task', async () => {
      const mockTask = {
        id: 1,
        status: 'IN_PROGRESS',
        updatedAt: null,
      } as unknown as IngestionTask;

      mockIngestionTaskRepository.findOne.mockResolvedValue(mockTask);
      mockIngestionTaskRepository.save.mockResolvedValue({
        ...mockTask,
        status: 'COMPLETED',
        updatedAt: new Date(),
      });

      const result = await ingestionTaskRepository.updateTaskStatus(1, 'COMPLETED');

      expect(result.status).toEqual('COMPLETED');
      expect(result.updatedAt).toBeDefined();
      expect(mockIngestionTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockIngestionTaskRepository.save).toHaveBeenCalledWith({
        ...mockTask,
        status: 'COMPLETED',
        updatedAt: expect.any(Date),
      });
    });

    it('should throw a NotFoundException if the task does not exist', async () => {
      mockIngestionTaskRepository.findOne.mockResolvedValue(null);

      await expect(ingestionTaskRepository.updateTaskStatus(999, 'COMPLETED')).rejects.toThrow(
        new NotFoundException('Task with id 999 not found'),
      );
    });
  });

  describe('findTaskById', () => {
    it('should return a task if the ID exists', async () => {
      const mockTask = {
        id: 1,
        status: 'IN_PROGRESS',
        user: { id: 1, username: 'test-user' },
      } as IngestionTask;

      mockIngestionTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await ingestionTaskRepository.findTaskById(1);

      expect(result).toEqual(mockTask);
      expect(mockIngestionTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
    });

    it('should throw a NotFoundException if the task does not exist', async () => {
      mockIngestionTaskRepository.findOne.mockResolvedValue(null);

      await expect(ingestionTaskRepository.findTaskById(999)).rejects.toThrow(new NotFoundException('Task with id 999 not found'));
    });
  });
});
