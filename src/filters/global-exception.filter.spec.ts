import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let globalExceptionFilter: GlobalExceptionFilter<unknown>;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    globalExceptionFilter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/test-url',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle generic exceptions and return a 500 status', () => {
    const exception = new Error('Something went wrong');

    globalExceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'InternalServerError',
      timestamp: expect.any(String),
      path: '/test-url',
      method: 'GET',
    });
  });

  it('should handle HttpException and return the correct status and message', () => {
    const exception = new HttpException('Custom error message', HttpStatus.BAD_REQUEST);

    globalExceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Custom error message',
      code: 'HttpException',
      timestamp: expect.any(String),
      path: '/test-url',
      method: 'GET',
    });
  });

  it('should handle BadRequestException with validation errors', () => {
    const validationErrors = ['Field A is required', 'Field B must be a number'];
    const exception = new BadRequestException({ message: validationErrors });

    globalExceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Field A is required, Field B must be a number',
      code: 'ValidationError',
      timestamp: expect.any(String),
      path: '/test-url',
      method: 'GET',
    });
  });

  it('should handle HttpException with an object response', () => {
    const exception = new HttpException({ message: 'Object error message' }, HttpStatus.FORBIDDEN);

    globalExceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Object error message',
      code: 'HttpException',
      timestamp: expect.any(String),
      path: '/test-url',
      method: 'GET',
    });
  });
});
