# mcp-feodotracker

abuse.ch Feodo Tracker botnet C&C IP blocklist

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list` | Current C&C blocklist (optional malware-family / status filter). |
| `check_ip` | Check whether a given IPv4 is on the current blocklist. |
| `recent` | Blocklist entries first seen in the last N hours. |
| `aggressive` | Full aggressive blocklist (includes older + lower-confidence IPs). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "feodotracker": {
      "url": "https://gateway.pipeworx.io/feodotracker/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Feodotracker data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
