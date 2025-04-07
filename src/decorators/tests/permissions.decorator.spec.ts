import { SetMetadata } from '@nestjs/common';
import { RequirePermissions } from '../permissions.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('RequirePermissions Decorator', () => {
  it('should call SetMetadata with the correct key and permissions', () => {
    const mockPermissions = ['read', 'write'];

    RequirePermissions(mockPermissions);

    expect(SetMetadata).toHaveBeenCalledWith('permissions', mockPermissions);
  });

  it('should handle an empty permissions array', () => {
    const mockPermissions: string[] = [];

    RequirePermissions(mockPermissions);

    expect(SetMetadata).toHaveBeenCalledWith('permissions', mockPermissions);
  });
});
