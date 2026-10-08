import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getApiClient } from '../logto-client.js';
import { catchResult, fromApiResponse } from '../lib/respond.js';

export function registerOrganizationTools(server: McpServer): void {
  server.registerTool(
    'list_organizations',
    {
      description: 'List Logto organizations with optional query and pagination.',
      inputSchema: {
        q: z
          .string()
          .optional()
          .describe('Filter by partial organization ID or name'),
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
        showFeatured: z
          .boolean()
          .optional()
          .describe('Include featured users in the response'),
      },
    },
    async ({ q, page, page_size, showFeatured }) => {
      try {
        const query: Record<string, string | number> = {};
        if (q) query.q = q;
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;
        if (showFeatured !== undefined) {
          query.showFeatured = showFeatured ? 'true' : 'false';
        }

        const response = await getApiClient().GET('/api/organizations', {
          params: { query },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'get_organization',
    {
      description: 'Get a Logto organization by ID.',
      inputSchema: {
        id: z.string().describe('Organization ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().GET('/api/organizations/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'create_organization',
    {
      description: 'Create a Logto organization.',
      inputSchema: {
        name: z.string().describe('Organization name'),
        description: z.string().nullable().optional(),
        customData: z.record(z.string(), z.unknown()).optional(),
        isMfaRequired: z.boolean().optional(),
      },
    },
    async ({ name, description, customData, isMfaRequired }) => {
      try {
        const body: Record<string, unknown> = { name };
        if (description !== undefined) body.description = description;
        if (customData !== undefined) body.customData = customData;
        if (isMfaRequired !== undefined) body.isMfaRequired = isMfaRequired;

        const response = await getApiClient().POST('/api/organizations', {
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'update_organization',
    {
      description: 'Update a Logto organization by ID (partial update).',
      inputSchema: {
        id: z.string().describe('Organization ID'),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        customData: z.record(z.string(), z.unknown()).optional(),
        isMfaRequired: z.boolean().optional(),
      },
    },
    async ({ id, name, description, customData, isMfaRequired }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (description !== undefined) body.description = description;
        if (customData !== undefined) body.customData = customData;
        if (isMfaRequired !== undefined) body.isMfaRequired = isMfaRequired;

        const response = await getApiClient().PATCH('/api/organizations/{id}', {
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
    'delete_organization',
    {
      description: 'Delete a Logto organization by ID.',
      inputSchema: {
        id: z.string().describe('Organization ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().DELETE('/api/organizations/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response, { ok: true, id });
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'list_organization_members',
    {
      description: 'List user members of a Logto organization.',
      inputSchema: {
        id: z.string().describe('Organization ID'),
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ id, page, page_size }) => {
      try {
        const query: Record<string, number> = {};
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;

        const response = await getApiClient().GET('/api/organizations/{id}/users', {
          params: {
            path: { id },
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
    'add_organization_members',
    {
      description: 'Add users as members of a Logto organization.',
      inputSchema: {
        id: z.string().describe('Organization ID'),
        userIds: z.array(z.string()).min(1).describe('User IDs to add'),
      },
    },
    async ({ id, userIds }) => {
      try {
        const response = await getApiClient().POST(
          '/api/organizations/{id}/users',
          {
            params: { path: { id } },
            body: { userIds },
          },
        );
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'remove_organization_member',
    {
      description: 'Remove a user from a Logto organization.',
      inputSchema: {
        id: z.string().describe('Organization ID'),
        userId: z.string().describe('User ID to remove'),
      },
    },
    async ({ id, userId }) => {
      try {
        const response = await getApiClient().DELETE(
          '/api/organizations/{id}/users/{userId}',
          {
            params: { path: { id, userId } },
          },
        );
        return fromApiResponse(response, { ok: true, id, userId });
      } catch (error) {
        return catchResult(error);
      }
    },
  );
}
