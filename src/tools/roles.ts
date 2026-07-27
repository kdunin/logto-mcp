import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getApiClient } from '../logto-client.js';
import { catchResult, fromApiResponse } from '../lib/respond.js';

const roleType = z.enum(['User', 'MachineToMachine']);

export function registerRoleTools(server: McpServer): void {
  server.registerTool(
    'list_roles',
    {
      description: 'List Logto API resource roles with optional filters and pagination.',
      inputSchema: {
        type: roleType.optional().describe('Filter by role type'),
        search: z.string().optional().describe('Search query'),
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ type, search, page, page_size }) => {
      try {
        const query: Record<string, unknown> = {};
        if (type) query.type = type;
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;
        if (search) query.search = search;

        const response = await getApiClient().GET('/api/roles', {
          params: { query: query as never },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'get_role',
    {
      description: 'Get a Logto role by ID.',
      inputSchema: {
        id: z.string().describe('Role ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().GET('/api/roles/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'create_role',
    {
      description: 'Create a Logto API resource role.',
      inputSchema: {
        name: z.string().describe('Unique role name'),
        description: z.string().describe('Role description'),
        type: roleType.optional().describe('Role type (default User)'),
        isDefault: z
          .boolean()
          .optional()
          .describe('Whether new users get this role by default'),
        scopeIds: z
          .array(z.string())
          .optional()
          .describe('Initial API resource scope IDs'),
      },
    },
    async ({ name, description, type, isDefault, scopeIds }) => {
      try {
        const body: Record<string, unknown> = { name, description };
        if (type !== undefined) body.type = type;
        if (isDefault !== undefined) body.isDefault = isDefault;
        if (scopeIds !== undefined) body.scopeIds = scopeIds;

        const response = await getApiClient().POST('/api/roles', {
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'update_role',
    {
      description: 'Update a Logto role by ID (partial update).',
      inputSchema: {
        id: z.string().describe('Role ID'),
        name: z.string().optional(),
        description: z.string().optional(),
        isDefault: z.boolean().optional(),
      },
    },
    async ({ id, name, description, isDefault }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (description !== undefined) body.description = description;
        if (isDefault !== undefined) body.isDefault = isDefault;

        const response = await getApiClient().PATCH('/api/roles/{id}', {
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
    'delete_role',
    {
      description: 'Delete a Logto role by ID.',
      inputSchema: {
        id: z.string().describe('Role ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().DELETE('/api/roles/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response, { ok: true, id });
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'list_user_roles',
    {
      description: 'List API resource roles assigned to a user.',
      inputSchema: {
        userId: z.string().describe('User ID'),
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ userId, page, page_size }) => {
      try {
        const query: Record<string, number> = {};
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;

        const response = await getApiClient().GET('/api/users/{userId}/roles', {
          params: {
            path: { userId },
            query,
          },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'assign_user_roles',
    {
      description:
        'Assign API resource roles to a user (adds to existing roles).',
      inputSchema: {
        userId: z.string().describe('User ID'),
        roleIds: z.array(z.string()).min(1).describe('Role IDs to assign'),
      },
    },
    async ({ userId, roleIds }) => {
      try {
        const response = await getApiClient().POST('/api/users/{userId}/roles', {
          params: { path: { userId } },
          body: { roleIds },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );
}
