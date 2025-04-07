import { RedisService } from '../redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';

describe('RedisService', () => {
  let redisService: RedisService;
  let cacheManagerMock: { set: jest.Mock; get: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    cacheManagerMock = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
  });

  describe('set', () => {
    it('should set a key-value pair in Redis', async () => {
      const key = 123;
      const value = 'test-value';

      await redisService.set(key, value);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(key.toString(), value);
    });

    it('should handle errors when setting a key-value pair', async () => {
      const key = 123;
      const value = 'test-value';
      cacheManagerMock.set.mockRejectedValue(new Error('Redis set error'));

      await expect(redisService.set(key, value)).rejects.toThrow('Redis set error');
    });
  });

  describe('get', () => {
    it('should get a value from Redis by key', async () => {
      const key = 123;
      const value = 'test-value';
      cacheManagerMock.get.mockResolvedValue(value);

      const result = await redisService.get(key);

      expect(result).toEqual(value);
      expect(cacheManagerMock.get).toHaveBeenCalledWith(key.toString());
    });

    it('should return null if the key does not exist in Redis', async () => {
      const key = 123;
      cacheManagerMock.get.mockResolvedValue(null);

      const result = await redisService.get(key);

      expect(result).toBeNull();
      expect(cacheManagerMock.get).toHaveBeenCalledWith(key.toString());
    });

    it('should handle errors when getting a value', async () => {
      const key = 123;
      cacheManagerMock.get.mockRejectedValue(new Error('Redis get error'));

      await expect(redisService.get(key)).rejects.toThrow('Redis get error');
    });
  });

  describe('del', () => {
    it('should delete a key from Redis', async () => {
      const key = 'test-key';

      await redisService.del(key);

      expect(cacheManagerMock.del).toHaveBeenCalledWith(key.toString());
    });

    it('should handle errors when deleting a key', async () => {
      const key = 'test-key';
      cacheManagerMock.del.mockRejectedValue(new Error('Redis delete error'));

      await expect(redisService.del(key)).rejects.toThrow('Redis delete error');
    });
  });
});
