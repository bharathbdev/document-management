import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { IDocumentRepository } from '../interfaces/idocument.repository';

@Injectable()
export class DocumentRepository implements IDocumentRepository {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async findByName(documentName: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { documentName },
    });
    if (!document) {
      throw new NotFoundException(`Document with name "${documentName}" not found`);
    }
    return document;
  }

  create(document: Partial<Document>): Document {
    return this.documentRepository.create(document);
  }

  save(document: Document): Promise<Document> {
    return this.documentRepository.save(document);
  }

  async findById(documentId: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException(`Document with ID "${documentId}" not found`);
    }
    return document;
  }

  async remove(document: Document): Promise<Document> {
    return this.documentRepository.remove(document);
  }
}
