import { DocumentRepository } from '../document.repository';
import { Repository } from 'typeorm';
import { Document } from '../../entities/document.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DocumentRepository', () => {
  let documentRepository: DocumentRepository;
  let mockDocumentRepository: jest.Mocked<Repository<Document>>;

  beforeEach(async () => {
    mockDocumentRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Document>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRepository,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    documentRepository = module.get<DocumentRepository>(DocumentRepository);
  });

  describe('findByName', () => {
    it('should return a document if the name exists', async () => {
      const mockDocument = { id: 1, documentName: 'Test Document' } as Document;
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      const result = await documentRepository.findByName('Test Document');

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { documentName: 'Test Document' },
      });
    });

    it('should throw a NotFoundException if the document name does not exist', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(documentRepository.findByName('Nonexistent Document')).rejects.toThrow(
        new NotFoundException('Document with name "Nonexistent Document" not found'),
      );
    });
  });

  describe('create', () => {
    it('should create and return a new document entity', () => {
      const mockDocument = {
        documentName: 'New Document',
      } as Partial<Document>;
      const createdDocument = {
        id: 1,
        documentName: 'New Document',
      } as Document;

      mockDocumentRepository.create.mockReturnValue(createdDocument);

      const result = documentRepository.create(mockDocument);

      expect(result).toEqual(createdDocument);
      expect(mockDocumentRepository.create).toHaveBeenCalledWith(mockDocument);
    });
  });

  describe('save', () => {
    it('should save and return the document', async () => {
      const mockDocument = {
        id: 1,
        documentName: 'Updated Document',
      } as Document;

      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      const result = await documentRepository.save(mockDocument);

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.save).toHaveBeenCalledWith(mockDocument);
    });
  });

  describe('findById', () => {
    it('should return a document if the ID exists', async () => {
      const mockDocument = { id: 1, documentName: 'Test Document' } as Document;
      mockDocumentRepository.findOne.mockResolvedValue(mockDocument);

      const result = await documentRepository.findById(1);

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw a NotFoundException if the document ID does not exist', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);

      await expect(documentRepository.findById(999)).rejects.toThrow(new NotFoundException('Document with ID "999" not found'));
    });
  });

  describe('remove', () => {
    it('should remove and return the document', async () => {
      const mockDocument = { id: 1, documentName: 'Test Document' } as Document;

      mockDocumentRepository.remove.mockResolvedValue(mockDocument);

      const result = await documentRepository.remove(mockDocument);

      expect(result).toEqual(mockDocument);
      expect(mockDocumentRepository.remove).toHaveBeenCalledWith(mockDocument);
    });
  });
});
