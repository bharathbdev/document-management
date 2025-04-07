import { Document } from '../entities/document.entity';

export interface IDocumentRepository {
  findByName(documentName: string): Promise<Document>;
  create(document: Partial<Document>): Document;
  save(document: Document): Promise<Document>;
  findById(documentId: number): Promise<Document>;
  remove(document: Document): Promise<Document>;
}
