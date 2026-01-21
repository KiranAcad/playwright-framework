import { College, Env } from './runtimeConfig';


export const collegeUrls: Record<College, Record<Env, string>> = {
  collegeA: {
    dev: 'https://dev.collegeA.com',
    qa: 'https://qa.collegeA.com',
    stage: 'https://stage.collegeA.com',
    uat: 'https://uat.collegeA.com',
  },
  collegeB: {
    dev: 'https://dev.collegeB.com',
    qa: 'https://qa.collegeB.com',
    stage: 'https://stage.collegeB.com',
    uat: 'https://uat.collegeB.com',
  },
  collegeC: {
    dev: 'https://dev.collegeC.com',
    qa: 'https://qa.collegeC.com',
    stage: 'https://stage.collegeC.com',
    uat: 'https://uat.collegeC.com',
  },
  collegeD: {
    dev: 'https://dev.collegeD.com',
    qa: 'https://qa.collegeD.com',
    stage: 'https://stage.collegeD.com',
    uat: 'https://uat.collegeD.com',
  },
};


export function getCollegeUrl(college: College, env: Env): string {
  return collegeUrls[college]?.[env] ?? 'about:blank';
}
