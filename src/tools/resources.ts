import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getApiClient } from '../logto-client.js';
import { catchResult, fromApiResponse } from '../lib/respond.js';

const accessTokenTtl = z
  .number()
  .int()
  .min(1)
  .describe('Access token lifetime in seconds');

export function registerResourceTools(server: McpServer): void {
  server.registerTool(
    'list_resources',
    {
      description: 'List Logto API resources with optional pagination.',
      inputSchema: {
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ page, page_size }) => {
      try {
        const query: Record<string, unknown> = {};
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;

        const response = await getApiClient().GET('/api/resources', {
          params: { query: query as never },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'get_resource',
    {
      description: 'Get a Logto API resource by ID.',
      inputSchema: {
        id: z.string().describe('API resource ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().GET('/api/resources/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'create_resource',
    {
      description:
        'Create a Logto API resource. The indicator is the audience (`aud`) of its access tokens.',
      inputSchema: {
        name: z.string().describe('API resource name'),
        indicator: z
          .string()
          .describe('Resource indicator (an absolute URI, e.g. https://api.example.com)'),
        accessTokenTtl: accessTokenTtl.optional(),
      },
    },
    async ({ name, indicator, accessTokenTtl: ttl }) => {
      try {
        const body: Record<string, unknown> = { name, indicator };
        if (ttl !== undefined) body.accessTokenTtl = ttl;

        const response = await getApiClient().POST('/api/resources', {
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'update_resource',
    {
      description:
        'Update a Logto API resource by ID (partial update). The indicator cannot be changed.',
      inputSchema: {
        id: z.string().describe('API resource ID'),
        name: z.string().optional(),
        accessTokenTtl: accessTokenTtl.optional(),
      },
    },
    async ({ id, name, accessTokenTtl: ttl }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (ttl !== undefined) body.accessTokenTtl = ttl;

        const response = await getApiClient().PATCH('/api/resources/{id}', {
          params: { path: { id } },
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'delete_resource',
    {
      description: 'Delete a Logto API resource by ID, with its permissions.',
      inputSchema: {
        id: z.string().describe('API resource ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().DELETE('/api/resources/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response, { ok: true, id });
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'list_resource_scopes',
    {
      description: 'List the permissions (scopes) of a Logto API resource.',
      inputSchema: {
        resourceId: z.string().describe('API resource ID'),
        search: z.string().optional().describe('Search query'),
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ resourceId, search, page, page_size }) => {
      try {
        const query: Record<string, unknown> = {};
        if (search) query.search = search;
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;

        const response = await getApiClient().GET('/api/resources/{resourceId}/scopes', {
          params: { path: { resourceId }, query: query as never },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'create_resource_scope',
    {
      description: 'Create a permission (scope) on a Logto API resource.',
      inputSchema: {
        resourceId: z.string().describe('API resource ID'),
        name: z.string().describe('Permission name, e.g. read:items'),
        description: z.string().nullable().optional(),
      },
    },
    async ({ resourceId, name, description }) => {
      try {
        const body: Record<string, unknown> = { name };
        if (description !== undefined) body.description = description;

        const response = await getApiClient().POST('/api/resources/{resourceId}/scopes', {
          params: { path: { resourceId } },
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'delete_resource_scope',
    {
      description: 'Delete a permission (scope) from a Logto API resource.',
      inputSchema: {
        resourceId: z.string().describe('API resource ID'),
        scopeId: z.string().describe('Scope ID'),
      },
    },
    async ({ resourceId, scopeId }) => {
      try {
        const response = await getApiClient().DELETE(
          '/api/resources/{resourceId}/scopes/{scopeId}',
          { params: { path: { resourceId, scopeId } } },
        );
        return fromApiResponse(response, { ok: true, resourceId, scopeId });
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'assign_role_scopes',
    {
      description: 'Add API resource permissions (scopes) to an existing role.',
      inputSchema: {
        id: z.string().describe('Role ID'),
        scopeIds: z.array(z.string()).min(1).describe('Scope IDs to add'),
      },
    },
    async ({ id, scopeIds }) => {
      try {
        const response = await getApiClient().POST('/api/roles/{id}/scopes', {
          params: { path: { id } },
          body: { scopeIds } as never,
        });
        return fromApiResponse(response, { ok: true, id, scopeIds });
      } catch (error) {
        return catchResult(error);
      }
    },
  );
}
