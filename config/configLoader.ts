import { runtimeConfig } from './runtimeConfig';
import { getCollegeUrl } from './collegeUrls';

export function getConfig() {
  const { college, env } = runtimeConfig;
  const baseUrl = getCollegeUrl(college, env);

  console.log(`🚀 College: ${college}`);
  console.log(`🌍 Environment: ${env}`);
  console.log(`🔗 Base URL: ${baseUrl}`);

  return { baseUrl, college, env };
}
