import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from '../ingestionTask.service';
import { IngestionTaskRepository } from '../../database/repositories/ingestionTask.repository';
import { RedisService } from '../redis.service';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { STATUS } from '../../constants/status.enum';
import { IngestionInput, IngestionCallbackPayload } from '../../types/ingestion.type';
import { IngestionTask } from '../../database/entities/ingestion-task.entity';
import { generateRandomId } from '../../utilities/helper';

jest.mock('../../utilities/helper', () => ({
  generateRandomId: jest.fn(() => 123), // Mock the random ID generator
}));

describe('IngestionService', () => {
  let ingestionService: IngestionService;
  let ingestionTaskRepository: jest.Mocked<IngestionTaskRepository>;
  let redisService: jest.Mocked<RedisService>;

  const mockUser = {
    id: 1,
    username: 'test-user',
    password: 'hashedpassword',
    role: { id: 1, name: 'viewer', permissions: [], users: [] },
    documents: [],
    ingestionTasks: [],
  };

  const mockTask = {
    id: 123,
    status: STATUS.IN_PROGRESS,
    user: mockUser,
  } as unknown as IngestionTask;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: IngestionTaskRepository,
          useValue: {
            createTask: jest.fn(),
            updateTaskStatus: jest.fn(),
            findTaskById: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    ingestionService = module.get<IngestionService>(IngestionService);
    ingestionTaskRepository = module.get(IngestionTaskRepository);
    redisService = module.get(RedisService);
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      const mockInput: IngestionInput = { data: 'test-data' };

      ingestionTaskRepository.createTask.mockResolvedValue(mockTask);
      redisService.set.mockResolvedValue();

      const result = await ingestionService.triggerIngestion(mockInput, mockUser);

      expect(result).toEqual(mockTask);
      expect(ingestionTaskRepository.createTask).toHaveBeenCalledWith(
        123, // Mocked ID
        STATUS.IN_PROGRESS,
        mockInput,
        mockUser,
      );
      expect(redisService.set).toHaveBeenCalledWith(123, 'In Progress');
    });

    it('should throw an error if ingestion fails', async () => {
      const mockInput: IngestionInput = { data: 'test-data' };

      ingestionTaskRepository.createTask.mockRejectedValue(new Error('Database error'));

      await expect(ingestionService.triggerIngestion(mockInput, mockUser)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('handleCallback', () => {
    it('should handle callback successfully', async () => {
      const mockPayload: IngestionCallbackPayload = {
        id: 123,
        status: STATUS.COMPLETED,
      };

      ingestionTaskRepository.updateTaskStatus.mockResolvedValue(mockTask);
      redisService.set.mockResolvedValue();

      const result = await ingestionService.handleCallback(mockPayload);

      expect(result).toEqual({
        message: 'Callback received successfully',
        task: mockTask,
      });
      expect(ingestionTaskRepository.updateTaskStatus).toHaveBeenCalledWith(123, STATUS.COMPLETED);
      expect(redisService.set).toHaveBeenCalledWith(123, STATUS.COMPLETED);
    });

    it('should throw an error if callback handling fails', async () => {
      const mockPayload: IngestionCallbackPayload = {
        id: 123,
        status: STATUS.COMPLETED,
      };

      ingestionTaskRepository.updateTaskStatus.mockRejectedValue(new Error('Database error'));

      await expect(ingestionService.handleCallback(mockPayload)).rejects.toThrow(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getIngestionStatus', () => {
    it('should return status from Redis if available', async () => {
      redisService.get.mockResolvedValue(STATUS.IN_PROGRESS);

      const result = await ingestionService.getIngestionStatus(123);

      expect(result).toEqual({ id: 123, status: STATUS.IN_PROGRESS });
      expect(redisService.get).toHaveBeenCalledWith(123);
      expect(ingestionTaskRepository.findTaskById).not.toHaveBeenCalled();
    });

    it('should return status from PostgreSQL if not in Redis', async () => {
      redisService.get.mockResolvedValue(null);
      ingestionTaskRepository.findTaskById.mockResolvedValue(mockTask);
      redisService.set.mockResolvedValue();

      const result = await ingestionService.getIngestionStatus(123);

      expect(result).toEqual({ id: 123, status: STATUS.IN_PROGRESS });
      expect(redisService.get).toHaveBeenCalledWith(123);
      expect(ingestionTaskRepository.findTaskById).toHaveBeenCalledWith(123);
      expect(redisService.set).toHaveBeenCalledWith(123, STATUS.IN_PROGRESS);
    });
  });
});
