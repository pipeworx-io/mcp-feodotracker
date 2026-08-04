# @pipeworx/feodotracker

[Feodo Tracker](https://feodotracker.abuse.ch) MCP — abuse.ch's tracker of botnet command-and-control infrastructure for Dridex, Emotet, Qakbot, Heodo, TrickBot, and others. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `list(family?, status?)` — current C&C IP blocklist (entire list, optional family/status filter)
- `check_ip(ip)` — is the given IP currently listed as botnet C&C?
- `recent(hours?)` — entries first seen in the last N hours
- `aggressive()` — full aggressive blocklist (includes older + lower-confidence IPs)

## Data source

`https://feodotracker.abuse.ch/downloads/ipblocklist.json` (cached 15 min by the gateway).

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
