import { RolesGuard } from '../roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflectorMock: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflectorMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    rolesGuard = new RolesGuard(reflectorMock);
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      reflectorMock.get.mockReturnValue(null);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'admin' } }),
        }),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflectorMock.get).toHaveBeenCalledWith('roles', mockContext.getHandler());
    });

    it('should return true if the user has a required role', () => {
      reflectorMock.get.mockReturnValue(['admin', 'editor']);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'admin' } }),
        }),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflectorMock.get).toHaveBeenCalledWith('roles', mockContext.getHandler());
    });

    it('should return false if the user does not have a required role', () => {
      reflectorMock.get.mockReturnValue(['admin', 'editor']);

      const mockContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'viewer' } }),
        }),
      } as unknown as ExecutionContext;

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(false);
      expect(reflectorMock.get).toHaveBeenCalledWith('roles', mockContext.getHandler());
    });
  });
});
