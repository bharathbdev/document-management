import { PermissionGuard } from '../permission.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('PermissionGuard', () => {
  let permissionGuard: PermissionGuard;
  let reflectorMock: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflectorMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    permissionGuard = new PermissionGuard(reflectorMock);
  });

  describe('canActivate', () => {
    it('should return true if no permissions are required', () => {
      reflectorMock.get.mockReturnValue(null);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { permissions: [] } }),
        }),
      } as unknown as ExecutionContext;

      const result = permissionGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflectorMock.get).toHaveBeenCalledWith('permissions', mockContext.getHandler());
    });

    it('should return true if the user has all required permissions', () => {
      reflectorMock.get.mockReturnValue(['read', 'write']);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { permissions: ['read', 'write', 'delete'] },
          }),
        }),
      } as unknown as ExecutionContext;

      const result = permissionGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflectorMock.get).toHaveBeenCalledWith('permissions', mockContext.getHandler());
    });

    it('should return false if the user does not have all required permissions', () => {
      reflectorMock.get.mockReturnValue(['read', 'write']);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { permissions: ['read'] },
          }),
        }),
      } as unknown as ExecutionContext;

      const result = permissionGuard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(reflectorMock.get).toHaveBeenCalledWith('permissions', mockContext.getHandler());
    });
  });
});
