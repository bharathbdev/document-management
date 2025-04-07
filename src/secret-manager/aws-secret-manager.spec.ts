import * as AWS from 'aws-sdk';
import { fetchSecrets } from './aws-secret-manager';

jest.mock('aws-sdk', () => {
  const mockSecretsManager = {
    getSecretValue: jest.fn().mockImplementation(() => ({
      promise: jest.fn(),
    })),
  };
  return {
    SecretsManager: jest.fn(() => mockSecretsManager),
  };
});

describe('fetchSecrets', () => {
  let secretsManagerMock: jest.Mocked<AWS.SecretsManager>;
  const originalConsoleError = console.error;

  beforeEach(() => {
    secretsManagerMock = new AWS.SecretsManager() as jest.Mocked<AWS.SecretsManager>;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should fetch secrets from AWS Secrets Manager', async () => {
    const mockSecretName = 'test-secret';
    const mockSecretString = JSON.stringify({
      username: 'test-user',
      password: 'test-password',
      url: 'https://example.com',
      redistoken: 'test-token',
    });

    secretsManagerMock.getSecretValue.mockReturnValue({
      promise: jest.fn().mockResolvedValue({ SecretString: mockSecretString }),
    } as any);

    const result = await fetchSecrets(mockSecretName);

    expect(result).toEqual({
      username: 'test-user',
      password: 'test-password',
      url: 'https://example.com',
      redistoken: 'test-token',
    });
    expect(secretsManagerMock.getSecretValue).toHaveBeenCalledWith({
      SecretId: mockSecretName,
    });
  });

  it('should throw an error if fetching secrets fails', async () => {
    const mockSecretName = 'test-secret';
    secretsManagerMock.getSecretValue.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('AWS error')),
    } as any);

    await expect(fetchSecrets(mockSecretName)).rejects.toThrow('Failed to fetch secrets from AWS Secrets Manager');
    expect(secretsManagerMock.getSecretValue).toHaveBeenCalledWith({
      SecretId: mockSecretName,
    });
    expect(console.error).toHaveBeenCalledWith('Failed to fetch secrets from AWS Secrets Manager: AWS error');
  });
});
