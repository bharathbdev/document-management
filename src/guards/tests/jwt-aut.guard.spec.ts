import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(() => {
    jwtAuthGuard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return the user if no error occurs', () => {
      const mockUser = { id: 1, username: 'test-user' };
      const mockErr = null;
      const mockInfo = null;
      const mockContext = {} as ExecutionContext;

      const result = jwtAuthGuard.handleRequest(mockErr, mockUser, mockInfo, mockContext);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if an error occurs', () => {
      const mockErr = new Error('Authentication error');
      const mockUser = null;
      const mockInfo = null;
      const mockContext = {} as ExecutionContext;

      expect(() => {
        jwtAuthGuard.handleRequest(mockErr, mockUser, mockInfo, mockContext);
      }).toThrow('Authentication error');
    });

    it('should handle cases where user is null', () => {
      const mockErr = null;
      const mockUser = null;
      const mockInfo = { message: 'Invalid token' };
      const mockContext = {} as ExecutionContext;

      expect(() => {
        jwtAuthGuard.handleRequest(mockErr, mockUser, mockInfo, mockContext);
      }).toThrow('Unauthorized');
    });
  });
});
