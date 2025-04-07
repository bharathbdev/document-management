import * as AWS from 'aws-sdk';

export interface Secrets {
  username: string;
  password: string;
  url: string;
  redistoken?: string;
}

export const fetchSecrets = async (secretName: string): Promise<Secrets> => {
  const secretsManager = new AWS.SecretsManager({
    accessKeyId: process.env.ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
    region: process.env.REGION || '',
  });

  const params = {
    SecretId: secretName,
  };

  if (secretName !== 'local') {
    try {
      const data = await secretsManager.getSecretValue(params).promise();
      return JSON.parse(data.SecretString || '{}');
    } catch (error) {
      throw new Error('Failed to fetch secrets from AWS Secrets Manager');
    }
  } else {
    // Local environment fallback
    return {
      username: 'postgres',
      password: 'postgres',
      url: 'localhost',
      redistoken: '',
    };
  }
};
