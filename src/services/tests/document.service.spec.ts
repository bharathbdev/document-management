import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from '../document.service';
import { DocumentRepository } from '../../database/repositories/document.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { S3Service } from '../s3.service';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('DocumentService', () => {
  let documentService: DocumentService;
  let documentRepository: jest.Mocked<DocumentRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let s3Service: jest.Mocked<S3Service>;

  const mockDocument = {
    id: 1,
    documentName: 'Test Document',
    key: 'test-key',
    s3Url: 'https://example.com/test.pdf',
    user: {
      id: 1,
      username: 'test-user',
      password: 'hashedpassword',
      role: { id: 1, name: 'viewer', permissions: [], users: [] },
      documents: [],
      ingestionTasks: [],
    },
  };

  const mockUser = {
    id: 1,
    username: 'test-user',
    password: 'hashedpassword',
    role: { id: 1, name: 'viewer', permissions: [], users: [] },
    documents: [],
    ingestionTasks: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: DocumentRepository,
          useValue: {
            findByName: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            generatePresignedUrl: jest.fn(),
            deleteFile: jest.fn(),
            downloadFile: jest.fn(),
          },
        },
        {
          provide: JwtService, // Add JwtService mock
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    documentService = module.get<DocumentService>(DocumentService);
    documentRepository = module.get(DocumentRepository);
    userRepository = module.get(UserRepository);
    s3Service = module.get(S3Service);
  });

  describe('getDocumentRepository', () => {
    it('should return a document by name', async () => {
      documentRepository.findByName.mockResolvedValue(mockDocument);

      const result = await documentService.getDocumentRepository('Test Document');

      expect(result).toEqual(mockDocument);
      expect(documentRepository.findByName).toHaveBeenCalledWith('Test Document');
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const mockDocumentDto = {
        documentName: 'Test Document',
        file: mockFile,
        userId: 1,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      s3Service.uploadFile.mockResolvedValue('https://example.com/test.pdf');
      documentRepository.save.mockResolvedValue(mockDocument);

      const result = await documentService.uploadDocument(mockDocumentDto);

      expect(result).toEqual(mockDocument);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(s3Service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(documentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          documentName: 'Test Document',
          key: expect.any(String),
          s3Url: 'https://example.com/test.pdf',
          user: mockUser,
        }),
      );
    });
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned URL successfully', async () => {
      documentRepository.findById.mockResolvedValue(mockDocument);
      s3Service.generatePresignedUrl.mockResolvedValue('https://example.com/presigned-url');

      const result = await documentService.generatePresignedUrl(1);

      expect(result).toEqual({
        presignedUrl: 'https://example.com/presigned-url',
      });
      expect(documentRepository.findById).toHaveBeenCalledWith(1);
      expect(s3Service.generatePresignedUrl).toHaveBeenCalledWith(mockDocument.key);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      documentRepository.findById.mockResolvedValue(mockDocument);
      s3Service.deleteFile.mockResolvedValue({
        success: true,
        message: 'File deleted successfully',
      });
      documentRepository.remove.mockResolvedValue(mockDocument);

      const result = await documentService.deleteDocument(1);

      expect(result).toEqual(mockDocument);
      expect(documentRepository.findById).toHaveBeenCalledWith(1);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(mockDocument.key);
      expect(documentRepository.remove).toHaveBeenCalledWith(mockDocument);
    });

    it('should throw an error if S3 file deletion fails', async () => {
      documentRepository.findById.mockResolvedValue(mockDocument);
      s3Service.deleteFile.mockResolvedValue({
        success: false,
        message: 'Failed to delete file',
      }); // Include the message property

      await expect(documentService.deleteDocument(1)).rejects.toThrow(
        new HttpException('Failed to delete file from S3', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      documentRepository.findById.mockResolvedValue(mockDocument);
      s3Service.downloadFile.mockResolvedValue({
        success: true,
        data: Buffer.from('file-data'),
      });

      const result = await documentService.downloadFile(1);

      expect(result).toEqual({
        fileName: 'Test Document',
        data: Buffer.from('file-data'),
      });
      expect(documentRepository.findById).toHaveBeenCalledWith(1);
      expect(s3Service.downloadFile).toHaveBeenCalledWith(mockDocument.key);
    });

    it('should throw an error if S3 file download fails', async () => {
      documentRepository.findById.mockResolvedValue(mockDocument);
      s3Service.downloadFile.mockResolvedValue({ success: false, data: null }); // Include the data property

      await expect(documentService.downloadFile(1)).rejects.toThrow(
        new HttpException('Failed to download file from S3', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
