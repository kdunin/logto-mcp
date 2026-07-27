import { readFileSync, writeFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const out = [];
const log = (...args) => {
  const line = args
    .map((x) => (typeof x === 'string' ? x : JSON.stringify(x, null, 2)))
    .join(' ');
  out.push(line);
};

function loadEnv() {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

async function callTool(client, name, args = {}) {
  const result = await client.callTool({ name, arguments: args });
  const text = (result.content ?? [])
    .map((c) => ('text' in c ? c.text : JSON.stringify(c)))
    .join('\n');
  log('');
  log('===', name, result.isError ? 'ERROR' : 'OK', '===');
  log(text.slice(0, 2000));
  return result;
}

async function main() {
  loadEnv();

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['build/index.js'],
    env: { ...process.env },
    stderr: 'pipe',
  });

  const client = new Client({ name: 'logto-mcp-test', version: '1.0.0' });
  await client.connect(transport);

  const { tools } = await client.listTools();
  log('TOOLS_COUNT', String(tools.length));
  log('TOOLS', tools.map((t) => t.name).sort().join(', '));

  await callTool(client, 'logto_health');
  await callTool(client, 'list_users', { page: 1, page_size: 2 });
  await callTool(client, 'list_applications', { page: 1, page_size: 2 });
  await callTool(client, 'list_roles', { page: 1, page_size: 2 });
  await callTool(client, 'list_organizations', { page: 1, page_size: 2 });

  await client.close();
  log('');
  log('DONE');
}

main()
  .catch((error) => {
    log('FATAL', error?.stack || String(error));
  })
  .finally(() => {
    writeFileSync('mcp-test-result.txt', out.join('\n'), 'utf8');
  });
