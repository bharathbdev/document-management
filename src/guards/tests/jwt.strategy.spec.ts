import { JwtStrategy } from '../jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'supersecretkey';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should validate and return the user payload', async () => {
      const mockPayload = {
        sub: 1,
        username: 'test-user',
        role: 'admin',
        permissions: ['read', 'write'],
      };

      const result = await jwtStrategy.validate(mockPayload);

      expect(result).toEqual({
        userId: mockPayload.sub,
        username: mockPayload.username,
        role: mockPayload.role,
        permissions: mockPayload.permissions,
      });
    });

    it('should handle missing fields in the payload gracefully', async () => {
      const mockPayload = {
        sub: 1,
        username: 'test-user',
      };

      const result = await jwtStrategy.validate(mockPayload);

      expect(result).toEqual({
        userId: mockPayload.sub,
        username: mockPayload.username,
        role: undefined,
        permissions: undefined,
      });
    });
  });
});
