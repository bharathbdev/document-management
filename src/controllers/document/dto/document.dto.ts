import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ description: 'The name of the document to be created' })
  @IsString()
  @IsNotEmpty({ message: 'Document name is required' })
  documentName: string;
}
