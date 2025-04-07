import { S3Service } from '../s3.service';
import { S3 } from 'aws-sdk';

jest.mock('aws-sdk', () => {
  const mockS3 = {
    upload: jest.fn().mockImplementation(() => ({
      promise: jest.fn(),
    })),
    getObject: jest.fn().mockImplementation(() => ({
      promise: jest.fn(),
    })),
    deleteObject: jest.fn().mockImplementation(() => ({
      promise: jest.fn(),
    })),
    listObjectsV2: jest.fn().mockImplementation(() => ({
      promise: jest.fn(),
    })),
    getSignedUrlPromise: jest.fn(),
  };

  const mockAWS = {
    config: {
      update: jest.fn(), // Mock AWS.config.update
    },
  };

  return { S3: jest.fn(() => mockS3), config: mockAWS.config };
});

describe('S3Service', () => {
  let s3Service: S3Service;
  let s3Mock: jest.Mocked<S3>;

  beforeAll(() => {
    process.env.AWS_S3_BUCKET = 'test-bucket'; // Mock the bucket name
    process.env.AWS_REGION = 'us-east-1'; // Mock the AWS region
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key'; // Mock the access key
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'; // Mock the secret key
  });

  beforeEach(() => {
    s3Service = new S3Service();
    s3Mock = new S3() as jest.Mocked<S3>;
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const mockUploadResult = { Location: 'https://example.com/test.pdf' };
      s3Mock.upload.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult),
      } as any);

      const result = await s3Service.uploadFile(mockFile);

      expect(result).toEqual(mockUploadResult.Location);
      expect(s3Mock.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: expect.any(String),
          Key: expect.stringContaining(mockFile.originalname),
          Body: mockFile.buffer,
          ContentType: mockFile.mimetype,
        }),
      );
    });

    it('should throw an error if upload fails', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      s3Mock.upload.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Upload failed')),
      } as any);

      await expect(s3Service.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      const mockFilename = 'test.pdf';
      const mockData = Buffer.from('file-data');
      s3Mock.getObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Body: mockData }),
      } as any);

      const result = await s3Service.downloadFile(mockFilename);

      expect(result).toEqual({ success: true, data: mockData });
      expect(s3Mock.getObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: expect.any(String),
          Key: mockFilename,
        }),
      );
    });

    it('should return an error if download fails', async () => {
      const mockFilename = 'test.pdf';
      s3Mock.getObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Download failed')),
      } as any);

      const result = await s3Service.downloadFile(mockFilename);

      expect(result).toEqual({ success: false, data: null });
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const mockFilename = 'test.pdf';
      s3Mock.deleteObject.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      } as any);

      const result = await s3Service.deleteFile(mockFilename);

      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully',
      });
      expect(s3Mock.deleteObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: expect.any(String),
          Key: mockFilename,
        }),
      );
    });

    it('should return an error if deletion fails', async () => {
      const mockFilename = 'test.pdf';
      s3Mock.deleteObject.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Deletion failed')),
      } as any);

      const result = await s3Service.deleteFile(mockFilename);

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete file',
      });
    });
  });

  describe('listFiles', () => {
    it('should list all files successfully', async () => {
      const mockFiles = {
        Contents: [{ Key: 'file1.pdf' }, { Key: 'file2.pdf' }],
      };
      s3Mock.listObjectsV2.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockFiles),
      } as any);

      const result = await s3Service.listFiles();

      expect(result).toEqual({
        success: true,
        data: ['file1.pdf', 'file2.pdf'],
      });
      expect(s3Mock.listObjectsV2).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: expect.any(String),
        }),
      );
    });

    it('should return an error if listing files fails', async () => {
      s3Mock.listObjectsV2.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('List files failed')),
      } as any);

      const result = await s3Service.listFiles();

      expect(result).toEqual({ success: false, data: null });
    });
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned URL successfully', async () => {
      const mockFilename = 'test.pdf';
      const mockPresignedUrl = 'https://example.com/presigned-url';
      s3Mock.getSignedUrlPromise.mockResolvedValue(mockPresignedUrl);

      const result = await s3Service.generatePresignedUrl(mockFilename);

      expect(result).toEqual(mockPresignedUrl);
      expect(s3Mock.getSignedUrlPromise).toHaveBeenCalledWith(
        'putObject',
        expect.objectContaining({
          Bucket: expect.any(String),
          Key: mockFilename,
          Expires: expect.any(Number),
        }),
      );
    });

    it('should throw an error if presigned URL generation fails', async () => {
      const mockFilename = 'test.pdf';
      s3Mock.getSignedUrlPromise.mockRejectedValue(new Error('Presigned URL generation failed'));

      await expect(s3Service.generatePresignedUrl(mockFilename)).rejects.toThrow('Presigned URL generation failed');
    });
  });
});
