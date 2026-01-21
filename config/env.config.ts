import { College, Env } from './runtimeConfig';

export const envConfig: {
  env: Env;
  college: College;
} = {
  env: 'qa',          // change ONLY this
  college: 'collegeA' // change ONLY this
};
