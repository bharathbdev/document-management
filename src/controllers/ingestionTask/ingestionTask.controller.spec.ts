import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestionTask.controller';
import { IngestionService } from '../../services/ingestionTask.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { CallbackDto, TriggerIngestionDto } from './dto/ingestion.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IngestionTask } from 'src/database/entities/ingestion-task.entity';
import { STATUS } from 'src/constants/status.enum';

describe('IngestionController', () => {
  let controller: IngestionController;
  let ingestionService: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        {
          provide: IngestionService,
          useValue: {
            triggerIngestion: jest.fn(),
            getIngestionStatus: jest.fn(),
            handleCallback: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<IngestionController>(IngestionController);
    ingestionService = module.get<IngestionService>(IngestionService);
  });

  describe('triggerIngestion', () => {
    it('should trigger ingestion successfully', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'test-user' };
      const mockRequest = { user: mockUser };
      const mockDto: TriggerIngestionDto = { data: 'test-data' };
      const mockResponse = {
        id: 1,
        status: 'IN_PROGRESS',
        message: 'Ingestion triggered successfully',
      };

      jest.spyOn(ingestionService, 'triggerIngestion').mockResolvedValue(mockResponse as unknown as IngestionTask);

      // Act
      const result = await controller.triggerIngestion(mockDto, mockRequest);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(ingestionService.triggerIngestion).toHaveBeenCalledWith(mockDto, mockUser);
    });

    it('should throw an error if ingestion fails', async () => {
      // Arrange
      const mockUser = { id: 1, username: 'test-user' };
      const mockRequest = { user: mockUser };
      const mockDto: TriggerIngestionDto = { data: 'test-data' };

      jest
        .spyOn(ingestionService, 'triggerIngestion')
        .mockRejectedValue(new HttpException('Failed to trigger ingestion', HttpStatus.INTERNAL_SERVER_ERROR));

      // Act & Assert
      await expect(controller.triggerIngestion(mockDto, mockRequest)).rejects.toThrow(HttpException);
      expect(ingestionService.triggerIngestion).toHaveBeenCalledWith(mockDto, mockUser);
    });
  });

  describe('getIngestionStatus', () => {
    it('should return ingestion status successfully', async () => {
      // Arrange
      const mockId = 1;
      const mockResponse = { id: mockId, status: 'COMPLETED' };

      jest.spyOn(ingestionService, 'getIngestionStatus').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.getIngestionStatus(mockId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(ingestionService.getIngestionStatus).toHaveBeenCalledWith(mockId);
    });

    it('should throw an error if ingestion status retrieval fails', async () => {
      // Arrange
      const mockId = 1;

      jest
        .spyOn(ingestionService, 'getIngestionStatus')
        .mockRejectedValue(new HttpException('Ingestion task not found', HttpStatus.NOT_FOUND));

      // Act & Assert
      await expect(controller.getIngestionStatus(mockId)).rejects.toThrow(HttpException);
      expect(ingestionService.getIngestionStatus).toHaveBeenCalledWith(mockId);
    });
  });

  describe('handleCallback', () => {
    it('should handle callback successfully', async () => {
      // Arrange
      const mockPayload: CallbackDto = { id: 1, status: 'COMPLETED' };
      const mockResponse = {
        message: 'Callback received successfully',
        task: {
          id: 1,
          status: 'COMPLETED',
          ingestionInput: 'test-input',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 1, username: 'test-user' },
        },
      };

      jest.spyOn(ingestionService, 'handleCallback').mockResolvedValue(mockResponse as unknown as { message: string; task: IngestionTask });

      // Act
      const result = await controller.handleCallback(mockPayload);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(ingestionService.handleCallback).toHaveBeenCalledWith(mockPayload);
    });

    it('should throw an error if callback handling fails', async () => {
      // Arrange
      const mockPayload = { id: 1, status: STATUS.COMPLETED };

      jest
        .spyOn(ingestionService, 'handleCallback')
        .mockRejectedValue(new HttpException('Failed to handle callback', HttpStatus.INTERNAL_SERVER_ERROR));

      // Act & Assert
      await expect(controller.handleCallback(mockPayload)).rejects.toThrow(HttpException);
      expect(ingestionService.handleCallback).toHaveBeenCalledWith(mockPayload);
    });
  });
});
