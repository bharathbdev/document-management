import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
  Get,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { DocumentService } from 'src/services/document.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RequirePermissions } from 'src/decorators/permissions.decorator';
import { PermissionGuard } from 'src/guards/permission.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDocumentDto } from './dto/document.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Document } from 'src/database/entities/document.entity';

@ApiTags('Document')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermissions(['write'])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a new document',
    operationId: 'uploadDocument',
  })
  @ApiBody({
    description: 'Document upload payload',
    schema: {
      type: 'object',
      properties: {
        documentName: {
          type: 'string',
          description: 'The name of the document',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'File is required or invalid input',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Body() documentDto: UploadDocumentDto, @Req() req: any): Promise<any> {
    const userId = req.user.userId;
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      return await this.documentService.uploadDocument({
        documentName: documentDto.documentName,
        file,
        userId,
      });
    } catch (error) {
      throw new HttpException(error.message || 'Failed to upload document', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'editor', 'viewer')
  @RequirePermissions(['read'])
  @ApiOperation({
    summary: 'Generate a pre-signed URL for a document',
    operationId: 'generatePresignedUrl',
  })
  @ApiParam({ name: 'id', description: 'The ID of the document' })
  @ApiResponse({
    status: 200,
    description: 'Pre-signed URL generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePresignedUrl(@Param('id') documentId: number): Promise<{ presignedUrl: string }> {
    try {
      return await this.documentService.generatePresignedUrl(documentId);
    } catch (error) {
      throw new NotFoundException(error.message || 'Failed to generate pre-signed URL');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  @RequirePermissions(['delete'])
  @ApiOperation({ summary: 'Delete a document', operationId: 'deleteDocument' })
  @ApiParam({ name: 'id', description: 'The ID of the document to delete' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete document' })
  async deleteDocument(id: number): Promise<Document> {
    try {
      const result = await this.documentService.deleteDocument(id);
      if (!result) {
        throw new NotFoundException('Document not found');
      }
      return result;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete document', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('download/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'viewer', 'editor')
  @RequirePermissions(['read'])
  @ApiOperation({ summary: 'Download a document', operationId: 'downloadFile' })
  @ApiParam({ name: 'id', description: 'The ID of the document to download' })
  @ApiResponse({ status: 200, description: 'Document downloaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Failed to download document' })
  async downloadFile(@Param('id') documentId: number, @Res() res: Response): Promise<void> {
    try {
      const fileStream = await this.documentService.downloadFile(documentId);

      if (!fileStream) {
        throw new NotFoundException('Document not found or failed to download');
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileStream.fileName}"`);
      res.send(fileStream.data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to download file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('documentName:name')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'viewer', 'editor')
  @RequirePermissions(['read'])
  @ApiOperation({
    summary: 'Get a document by name',
    operationId: 'getDocumentByName',
  })
  @ApiParam({
    name: 'name',
    description: 'The name of the document to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDocumentByName(@Param('name') documentName: string): Promise<any> {
    try {
      return await this.documentService.getDocumentRepository(documentName);
    } catch (error) {
      throw new NotFoundException(error.message || 'Document not found');
    }
  }
}
