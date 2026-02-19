import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // explicitly load .env

function requireEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) throw new Error(`Environment variable ${varName} is not set!`);
  return value;
}

export const config = {
  baseUrl: requireEnv('BASE_URL'),
  username: requireEnv('APP_USERNAME'),
  password: requireEnv('APP_PASSWORD'),
  logLevel: process.env.LOG_LEVEL ?? 'info',
};
