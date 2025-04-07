import * as bcrypt from 'bcrypt';
import { hashPassword, comparePasswords, generateRandomId } from './helper';

jest.mock('bcrypt');

describe('Helper Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a plain-text password', async () => {
      const mockPassword = 'plainPassword';
      const mockHashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

      const result = await hashPassword(mockPassword);

      expect(result).toEqual(mockHashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      const mockPassword = 'plainPassword';
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      await expect(hashPassword(mockPassword)).rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePasswords', () => {
    it('should return true if passwords match', async () => {
      const mockPlainPassword = 'plainPassword';
      const mockHashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePasswords(mockPlainPassword, mockHashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPlainPassword, mockHashedPassword);
    });

    it('should return false if passwords do not match', async () => {
      const mockPlainPassword = 'plainPassword';
      const mockHashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePasswords(mockPlainPassword, mockHashedPassword);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPlainPassword, mockHashedPassword);
    });

    it('should throw an error if bcrypt.compare fails', async () => {
      const mockPlainPassword = 'plainPassword';
      const mockHashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Comparison failed'));

      await expect(comparePasswords(mockPlainPassword, mockHashedPassword)).rejects.toThrow('Comparison failed');
    });
  });

  describe('generateRandomId', () => {
    it('should generate a random integer within the specified range', () => {
      const min = 1;
      const max = 100;
      const result = generateRandomId(min, max);

      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });

    it('should generate a random integer with default range if no arguments are provided', () => {
      const result = generateRandomId();

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});
