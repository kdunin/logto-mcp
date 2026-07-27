import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getApiClient } from '../logto-client.js';
import { catchResult, fromApiResponse, jsonResult } from '../lib/respond.js';

const paginationSchema = {
  page: z.number().int().min(1).optional().describe('Page number (starts from 1)'),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Entries per page (default 20)'),
};

export function registerUserTools(server: McpServer): void {
  server.registerTool(
    'list_users',
    {
      description:
        'List Logto users with optional search and pagination. Search uses Logto advanced user search query syntax.',
      inputSchema: {
        search: z
          .string()
          .optional()
          .describe('Search query (e.g. email, username, or advanced search syntax)'),
        ...paginationSchema,
      },
    },
    async ({ search, page, page_size }) => {
      try {
        const client = getApiClient();
        const query: Record<string, string | number> = {};
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;
        if (search) query.search = search;

        const response = await client.GET('/api/users', {
          params: { query: query as never },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'get_user',
    {
      description: 'Get a Logto user by ID.',
      inputSchema: {
        userId: z.string().describe('User ID'),
      },
    },
    async ({ userId }) => {
      try {
        const response = await getApiClient().GET('/api/users/{userId}', {
          params: { path: { userId } },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'create_user',
    {
      description:
        'Create a Logto user. At least one of username, primaryEmail, or primaryPhone is typically required.',
      inputSchema: {
        username: z.string().optional().describe('Unique username'),
        primaryEmail: z.string().email().optional().describe('Unique primary email'),
        primaryPhone: z.string().optional().describe('Unique primary phone'),
        password: z.string().optional().describe('Plain text password'),
        name: z.string().optional().describe('Display name'),
        avatar: z.string().url().optional().describe('Avatar URL'),
        customData: z
          .record(z.unknown())
          .optional()
          .describe('Arbitrary custom data object'),
      },
    },
    async (args) => {
      try {
        const { customData, ...rest } = args;
        const body: Record<string, unknown> = { ...rest };
        if (customData) body.customData = customData;

        const response = await getApiClient().POST('/api/users', {
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'update_user',
    {
      description: 'Update a Logto user by ID (partial update).',
      inputSchema: {
        userId: z.string().describe('User ID'),
        username: z.string().nullable().optional(),
        primaryEmail: z.string().nullable().optional(),
        primaryPhone: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
        customData: z
          .record(z.unknown())
          .optional()
          .describe('Replaces the entire custom data object'),
      },
    },
    async ({ userId, ...body }) => {
      try {
        const payload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined) payload[key] = value;
        }

        const response = await getApiClient().PATCH('/api/users/{userId}', {
          params: { path: { userId } },
          body: payload as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'delete_user',
    {
      description: 'Delete a Logto user by ID.',
      inputSchema: {
        userId: z.string().describe('User ID'),
      },
    },
    async ({ userId }) => {
      try {
        const response = await getApiClient().DELETE('/api/users/{userId}', {
          params: { path: { userId } },
        });
        return fromApiResponse(response, { ok: true, userId });
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'logto_health',
    {
      description:
        'Verify Logto Management API credentials by listing one user page.',
    },
    async () => {
      try {
        const response = await getApiClient().GET('/api/users', {
          params: { query: { page: 1, page_size: 1 } },
        });
        if (response.error) {
          return fromApiResponse(response);
        }
        return jsonResult({
          ok: true,
          message: 'Logto Management API credentials are valid',
          sampleUserCount: Array.isArray(response.data) ? response.data.length : 0,
        });
      } catch (error) {
        return catchResult(error);
      }
    },
  );
}
