import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { getApiClient } from '../logto-client.js';
import { catchResult, fromApiResponse } from '../lib/respond.js';

const applicationType = z.enum([
  'Native',
  'SPA',
  'Traditional',
  'MachineToMachine',
  'Protected',
  'SAML',
]);

export function registerApplicationTools(server: McpServer): void {
  server.registerTool(
    'list_applications',
    {
      description: 'List Logto applications with optional type filter and pagination.',
      inputSchema: {
        types: z
          .array(applicationType)
          .optional()
          .describe('Filter by application types'),
        search: z.string().optional().describe('Search query'),
        page: z.number().int().min(1).optional(),
        page_size: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ types, search, page, page_size }) => {
      try {
        const query: Record<string, unknown> = {};
        if (types) query.types = types;
        if (page !== undefined) query.page = page;
        if (page_size !== undefined) query.page_size = page_size;
        if (search) query.search = search;

        const response = await getApiClient().GET('/api/applications', {
          params: { query: query as never },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'get_application',
    {
      description: 'Get a Logto application by ID.',
      inputSchema: {
        id: z.string().describe('Application ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().GET('/api/applications/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'create_application',
    {
      description: 'Create a Logto application.',
      inputSchema: {
        name: z.string().describe('Application name'),
        type: applicationType.describe('Application type'),
        description: z.string().nullable().optional(),
        isThirdParty: z.boolean().optional(),
        redirectUris: z
          .array(z.string())
          .optional()
          .describe('OIDC redirect URIs'),
        postLogoutRedirectUris: z
          .array(z.string())
          .optional()
          .describe('OIDC post-logout redirect URIs'),
      },
    },
    async ({
      name,
      type,
      description,
      isThirdParty,
      redirectUris,
      postLogoutRedirectUris,
    }) => {
      try {
        const body: Record<string, unknown> = { name, type };
        if (description !== undefined) body.description = description;
        if (isThirdParty !== undefined) body.isThirdParty = isThirdParty;
        if (redirectUris || postLogoutRedirectUris) {
          body.oidcClientMetadata = {
            redirectUris: redirectUris ?? [],
            postLogoutRedirectUris: postLogoutRedirectUris ?? [],
          };
        }

        const response = await getApiClient().POST('/api/applications', {
          body: body as never,
        });
        return fromApiResponse(response);
      } catch (error) {
        return catchResult(error);
      }
    },
  );

  server.registerTool(
    'update_application',
    {
      description: 'Update a Logto application by ID (partial update).',
      inputSchema: {
        id: z.string().describe('Application ID'),
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        isThirdParty: z.boolean().optional(),
        redirectUris: z.array(z.string()).optional(),
        postLogoutRedirectUris: z.array(z.string()).optional(),
      },
    },
    async ({ id, name, description, isThirdParty, redirectUris, postLogoutRedirectUris }) => {
      try {
        const body: Record<string, unknown> = {};
        if (name !== undefined) body.name = name;
        if (description !== undefined) body.description = description;
        if (isThirdParty !== undefined) body.isThirdParty = isThirdParty;
        if (redirectUris || postLogoutRedirectUris) {
          body.oidcClientMetadata = {
            ...(redirectUris ? { redirectUris } : {}),
            ...(postLogoutRedirectUris
              ? { postLogoutRedirectUris }
              : {}),
          };
        }

        const response = await getApiClient().PATCH('/api/applications/{id}', {
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
    'delete_application',
    {
      description: 'Delete a Logto application by ID.',
      inputSchema: {
        id: z.string().describe('Application ID'),
      },
    },
    async ({ id }) => {
      try {
        const response = await getApiClient().DELETE('/api/applications/{id}', {
          params: { path: { id } },
        });
        return fromApiResponse(response, { ok: true, id });
      } catch (error) {
        return catchResult(error);
      }
    },
  );
}
