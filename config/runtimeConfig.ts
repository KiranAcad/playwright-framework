import { envConfig } from './env.config';

export type Env = 'dev' | 'qa' | 'stage' | 'uat';
export type College = 'collegeA' | 'collegeB' | 'collegeC' | 'collegeD';

export const runtimeConfig = {
  env: envConfig.env,
  college: envConfig.college
};
