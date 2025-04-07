import * as bcrypt from 'bcrypt';

/**
 * Hashes a plain-text password.
 * @param password - The plain-text password to hash.
 * @returns The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // You can adjust the salt rounds as needed
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain-text password with a hashed password.
 * @param plainPassword - The plain-text password.
 * @param hashedPassword - The hashed password.
 * @returns True if the passwords match, false otherwise.
 */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generates a random integer between the specified range (inclusive).
 * @param min - The minimum value (inclusive).
 * @param max - The maximum value (inclusive).
 * @returns A random integer between min and max.
 */
export function generateRandomId(min: number = 1, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
