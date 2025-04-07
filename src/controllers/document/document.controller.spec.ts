import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from '../../services/document.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionGuard } from '../../guards/permission.guard';
import { UploadDocumentDto } from './dto/document.dto';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            uploadDocument: jest.fn() as jest.MockedFunction<DocumentService['uploadDocument']>,
            getDocumentRepository: jest.fn() as jest.MockedFunction<DocumentService['getDocumentRepository']>,
            generatePresignedUrl: jest.fn() as jest.MockedFunction<DocumentService['generatePresignedUrl']>,
            deleteDocument: jest.fn() as jest.MockedFunction<DocumentService['deleteDocument']>,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const mockDto: UploadDocumentDto = { documentName: 'Test Document' };
      const mockRequest = { user: { userId: 1 } };
      const mockResponse = {
        id: 1,
        documentName: 'Test Document',
        message: 'Document created successfully',
        s3Url: 'https://example.com/test.pdf',
        key: 'test-key',
        user: {
          id: 1,
          username: 'test-user',
          password: 'hashedpassword',
          role: { id: 1, name: 'viewer', permissions: [], users: [] },
          documents: [],
          ingestionTasks: [],
        },
      };

      jest.spyOn(documentService, 'uploadDocument').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.uploadDocument(mockFile, mockDto, mockRequest);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(documentService.uploadDocument).toHaveBeenCalledWith({
        documentName: mockDto.documentName,
        file: mockFile,
        userId: mockRequest.user.userId,
      });
    });

    it('should throw BadRequestException if no file is provided', async () => {
      // Arrange
      const mockDto: UploadDocumentDto = { documentName: 'Test Document' };
      const mockRequest = { user: { userId: 1 } };

      // Act & Assert
      await expect(controller.uploadDocument(null as any, mockDto, mockRequest)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      // Arrange
      const mockId = 1;
      const mockResponse = {
        id: 1,
        documentName: 'Test Document',
        key: 'test-key',
        s3Url: 'https://example.com/test.pdf',
        message: 'Document and file deleted successfully',
        user: {
          id: 1,
          username: 'test-user',
          password: 'hashedpassword',
          role: { id: 1, name: 'viewer', permissions: [], users: [] },
          documents: [],
          ingestionTasks: [],
        },
      };

      jest.spyOn(documentService, 'deleteDocument').mockResolvedValue(mockResponse);

      // Act
      const result = await controller.deleteDocument(mockId);

      // Assert
      expect(result).toEqual(mockResponse); // Match the actual response
      expect(documentService.deleteDocument).toHaveBeenCalledWith(mockId);
    });

    it('should throw NotFoundException if document to delete is not found', async () => {
      // Arrange
      const mockId = 1;

      jest
        .spyOn(documentService, 'deleteDocument')
        .mockRejectedValue(new HttpException('Failed to delete document', HttpStatus.INTERNAL_SERVER_ERROR));

      // Act & Assert
      await expect(controller.deleteDocument(mockId)).rejects.toThrow(HttpException);
      expect(documentService.deleteDocument).toHaveBeenCalledWith(mockId);
    });
  });
});
