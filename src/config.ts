const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  throw new Error(
    `[ProdFeedback] Missing required environment variable: ${key}. ` +
    `Please set ${key} in your .env file or environment variables.`
  );
};

export const API_BASE_URL = getEnvVar('PRODFEEDBACK_API_BASE_URL');

