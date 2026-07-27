import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

type ApiErrorLike = {
  error?: unknown;
  response?: Response;
  data?: unknown;
};

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function jsonResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function errorResult(message: string, details?: unknown): CallToolResult {
  const payload =
    details === undefined
      ? { error: message }
      : { error: message, details };
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Convert an openapi-fetch response into an MCP tool result.
 */
export function fromApiResponse(
  response: ApiErrorLike,
  emptySuccess: unknown = { ok: true },
): CallToolResult {
  if (response.error) {
    const status = response.response?.status;
    return errorResult(
      status
        ? `Logto API error (HTTP ${status})`
        : 'Logto API error',
      response.error,
    );
  }

  if (response.data === undefined || response.data === null) {
    return jsonResult(emptySuccess);
  }

  return jsonResult(response.data);
}

export function catchResult(error: unknown): CallToolResult {
  console.error('Tool execution failed:', error);
  return errorResult('Unexpected error', serializeError(error));
}
