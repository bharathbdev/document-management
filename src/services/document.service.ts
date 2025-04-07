import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DocumentRepository } from '../database/repositories/document.repository';
import { UserRepository } from '../database/repositories/user.repository';
import { Document } from '../database/entities/document.entity';
import { S3Service } from './s3.service';
import { DocumentInpt } from 'src/types/document.type';

@Injectable()
export class DocumentService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly documentRepository: DocumentRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
  ) {}

  async getDocumentRepository(documentName: string): Promise<Document> {
    const document = await this.documentRepository.findByName(documentName);
    if (document) {
      return document;
    }
    throw new NotFoundException('Document not found');
  }

  async uploadDocument(documentDto: DocumentInpt): Promise<Document> {
    const user = await this.userRepository.findById(documentDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const key = `${Date.now()}-${documentDto.file.originalname}`;

    const s3Url = await this.s3Service.uploadFile(documentDto.file);

    const document: any = {
      documentName: documentDto.documentName,
      key,
      s3Url,
    };
    document.user = user;

    return this.documentRepository.save(document);
  }

  async generatePresignedUrl(documentId: number): Promise<{ presignedUrl: string }> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const presignedUrl = await this.s3Service.generatePresignedUrl(document.key);
    return { presignedUrl };
  }

  async deleteDocument(documentId: number): Promise<Document> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const s3Result = await this.s3Service.deleteFile(document.key);
    if (!s3Result.success) {
      throw new HttpException('Failed to delete file from S3', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return await this.documentRepository.remove(document);
  }

  async downloadFile(documentId: number): Promise<{ fileName: string; data: Buffer }> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const result = await this.s3Service.downloadFile(document.key);
    if (!result.success) {
      throw new HttpException('Failed to download file from S3', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      fileName: document.documentName,
      data: result.data ?? Buffer.alloc(0),
    };
  }
}
