# Logto MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes the [Logto Management API](https://docs.logto.io/integrate-logto/interact-with-management-api) to MCP clients (Cursor, Claude Desktop, etc.).

Built with:

- [`@modelcontextprotocol/sdk`](https://modelcontextprotocol.io/docs/develop/build-server#typescript) (stdio transport)
- [`@logto/api`](https://www.npmjs.com/package/@logto/api) Management SDK

## Prerequisites

1. A Logto instance (self-hosted OSS or Cloud)
2. A **Machine-to-machine** application in Console → Applications
3. An M2M role that includes **Logto Management API** permissions (`all`)

See [Interact with Management API](https://docs.logto.io/integrate-logto/interact-with-management-api) for details.

## Setup

```bash
npm install
npm run build
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LOGTO_APP_ID` / `LOGTO_CLIENT_ID` | Yes | M2M application ID |
| `LOGTO_APP_SECRET` / `LOGTO_CLIENT_SECRET` | Yes | M2M application secret |
| `LOGTO_ENDPOINT` / `LOGTO_BASE_URL` | OSS | Self-hosted Logto base URL |
| `LOGTO_TENANT_ID` | Cloud | Cloud tenant ID (OSS defaults to `default`) |
| `LOGTO_API_INDICATOR` | No | OSS default: `https://default.logto.app/api` |

Copy `.env.example` as a reference. For MCP clients, pass variables in the `env` block (below).

### Self-hosted / OSS

```env
LOGTO_ENDPOINT=https://your.logto.endpoint
LOGTO_APP_ID=...
LOGTO_APP_SECRET=...
# Optional: LOGTO_TENANT_ID=default
# Optional: LOGTO_API_INDICATOR=https://default.logto.app/api
```

### Logto Cloud

```env
LOGTO_TENANT_ID=your-tenant-id
LOGTO_APP_ID=...
LOGTO_APP_SECRET=...
```

## Cursor / Claude Desktop / MetaMCP config

Local build:

```json
{
  "mcpServers": {
    "logto": {
      "command": "node",
      "args": ["C:/Users/rascal/projects/logto-mcp/build/index.js"],
      "env": {
        "LOGTO_ENDPOINT": "https://your.logto.endpoint",
        "LOGTO_APP_ID": "your-m2m-app-id",
        "LOGTO_APP_SECRET": "your-m2m-app-secret"
      }
    }
  }
}
```

From GitHub (after clone/install builds via `prepare`):

```json
{
  "mcpServers": {
    "logto": {
      "command": "npx",
      "args": ["-y", "github:KDunin/logto-mcp"],
      "env": {
        "LOGTO_ENDPOINT": "https://your.logto.endpoint",
        "LOGTO_APP_ID": "your-m2m-app-id",
        "LOGTO_APP_SECRET": "your-m2m-app-secret"
      }
    }
  }
}
```

Use an absolute path to `build/index.js` for local runs. After changing env or rebuilding, restart the MCP client.

## Tools

| Tool | Description |
|------|-------------|
| `logto_health` | Verify M2M credentials |
| `list_users` / `get_user` / `create_user` / `update_user` / `delete_user` | Users |
| `list_applications` / `get_application` / `create_application` / `update_application` / `delete_application` | Applications |
| `list_organizations` / `get_organization` / `create_organization` / `update_organization` / `delete_organization` | Organizations |
| `list_organization_members` / `add_organization_members` / `remove_organization_member` | Organization members |
| `list_roles` / `get_role` / `create_role` / `update_role` / `delete_role` | Roles |
| `list_user_roles` / `assign_user_roles` | User ↔ role assignment |

## Development

```bash
npm run build   # compile TypeScript to build/
npm start       # run stdio server (expects MCP client on stdin)
npm run dev     # tsc --watch
```

Logging goes to **stderr** only so stdout stays reserved for MCP JSON-RPC.

## Releasing

Releases are automated by [`.github/workflows/release.yml`](.github/workflows/release.yml) when you push a version tag.

1. Bump `version` in `package.json` (must match the tag without the `v` prefix).
2. Commit, then tag and push:

```bash
git tag v1.0.1
git push origin v1.0.1
```

The workflow will:

- Build the package
- Create a GitHub Release with notes and the `.tgz` artifact
- Publish to npm (stable tags only; requires repo secret `NPM_TOKEN`)

Prerelease tags like `v1.0.1-beta.1` create a GitHub prerelease and skip npm publish.

## License

MIT
