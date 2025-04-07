import { SetMetadata } from '@nestjs/common';
import { Roles } from '../roles.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with the correct key and roles', () => {
    const mockRoles = ['admin', 'editor'];

    Roles(...mockRoles);

    expect(SetMetadata).toHaveBeenCalledWith('roles', mockRoles);
  });

  it('should handle an empty roles array', () => {
    const mockRoles: string[] = [];

    Roles(...mockRoles);

    expect(SetMetadata).toHaveBeenCalledWith('roles', mockRoles);
  });
});
