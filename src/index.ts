#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerApplicationTools } from './tools/applications.js';
import { registerOrganizationTools } from './tools/organizations.js';
import { registerRoleTools } from './tools/roles.js';
import { registerUserTools } from './tools/users.js';

const server = new McpServer({
  name: 'logto',
  version: '1.0.0',
});

registerUserTools(server);
registerApplicationTools(server);
registerOrganizationTools(server);
registerRoleTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
