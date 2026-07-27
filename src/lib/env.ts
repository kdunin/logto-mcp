export type LogtoEnv = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  /** Present for self-hosted / OSS deployments. */
  baseUrl?: string;
  apiIndicator?: string;
};

function firstDefined(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value !== undefined && value.trim() !== '') {
      return value.trim();
    }
  }
  return undefined;
}

/**
 * Resolve Logto M2M credentials from environment variables.
 *
 * Self-hosted OSS: set LOGTO_ENDPOINT (or LOGTO_BASE_URL) plus app credentials.
 * Cloud: set LOGTO_TENANT_ID to your tenant id and omit LOGTO_ENDPOINT.
 */
export function loadLogtoEnv(): LogtoEnv {
  const clientId = firstDefined(
    process.env.LOGTO_APP_ID,
    process.env.LOGTO_CLIENT_ID,
  );
  const clientSecret = firstDefined(
    process.env.LOGTO_APP_SECRET,
    process.env.LOGTO_CLIENT_SECRET,
  );

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Logto M2M credentials. Set LOGTO_APP_ID and LOGTO_APP_SECRET (or LOGTO_CLIENT_ID / LOGTO_CLIENT_SECRET).',
    );
  }

  const baseUrl = firstDefined(
    process.env.LOGTO_ENDPOINT,
    process.env.LOGTO_BASE_URL,
  );
  const tenantId =
    firstDefined(process.env.LOGTO_TENANT_ID) ?? (baseUrl ? 'default' : undefined);

  if (!tenantId) {
    throw new Error(
      'Missing Logto tenant. For Cloud set LOGTO_TENANT_ID; for OSS set LOGTO_ENDPOINT (tenant defaults to "default").',
    );
  }

  const apiIndicator = firstDefined(process.env.LOGTO_API_INDICATOR);

  return {
    tenantId,
    clientId,
    clientSecret,
    baseUrl,
    apiIndicator:
      apiIndicator ??
      (baseUrl ? 'https://default.logto.app/api' : undefined),
  };
}
