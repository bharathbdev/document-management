import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly bucketName: string;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.s3 = new S3();
    this.bucketName = process.env.AWS_S3_BUCKET || '';
    if (!this.bucketName) {
      throw new Error('Bucket name is not defined in the environment variables.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await this.s3.upload(params).promise();
    return uploadResult.Location;
  }

  async downloadFile(filename: string): Promise<{ success: boolean; data: Buffer | null }> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: filename,
      };

      const res = await this.s3.getObject(params).promise();
      return { success: true, data: res.Body as Buffer };
    } catch (error) {
      return { success: false, data: null };
    }
  }

  async deleteFile(filename: string): Promise<{ success: boolean; message: string }> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: filename,
      };

      await this.s3.deleteObject(params).promise();
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to delete file' };
    }
  }

  async listFiles(): Promise<{ success: boolean; data: string[] | null }> {
    try {
      const params = {
        Bucket: this.bucketName,
      };

      const files = await this.s3.listObjectsV2(params).promise();
      const fileNames = (files.Contents ?? []).map((file) => file.Key || '');
      return { success: true, data: fileNames };
    } catch (error) {
      return { success: false, data: null };
    }
  }

  async generatePresignedUrl(fileName: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Expires: 60 * 5,
    };

    return this.s3.getSignedUrlPromise('putObject', params);
  }
}
