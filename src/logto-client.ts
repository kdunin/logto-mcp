import { createManagementApi } from '@logto/api/management';

import { loadLogtoEnv } from './lib/env.js';

export type ManagementApiClient = ReturnType<
  typeof createManagementApi
>['apiClient'];

let cachedClient: ManagementApiClient | undefined;

export function getApiClient(): ManagementApiClient {
  if (cachedClient) {
    return cachedClient;
  }

  const env = loadLogtoEnv();

  const options: Parameters<typeof createManagementApi>[1] = {
    clientId: env.clientId,
    clientSecret: env.clientSecret,
  };

  if (env.baseUrl) {
    options.baseUrl = env.baseUrl;
  }
  if (env.apiIndicator) {
    options.apiIndicator = env.apiIndicator;
  }

  const { apiClient } = createManagementApi(env.tenantId, options);
  cachedClient = apiClient;
  return apiClient;
}
