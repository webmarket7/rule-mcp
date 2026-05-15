# rule-mcp

A TypeScript MCP (Model Context Protocol) server.

## Build

```bash
npm install
npm run build
```

## Test in Claude Code

Add the server to your Claude Code MCP config:

```bash
claude mcp add rule-mcp node /home/ryzhyk/projects/Testing/rule-mcp/dist/index.js
```

Then verify it's registered:

```bash
claude mcp list
```

Restart Claude Code (or run `/mcp` in the Claude Code prompt) and the server's tools and resources will be available in your session.

### Try the example tool

Once connected, ask Claude:

> Use the `echo` tool with the message "hello"

### Try the example resource

> Read the resource `greeting://hello`

## Development

Watch mode rebuilds on save:

```bash
npm run dev
```

After each rebuild, reconnect the server in Claude Code with `/mcp` or by restarting the session.

## Project structure

```
src/
  index.ts   # Server entry point — add tools and resources here
dist/        # Compiled output (gitignored)
```

## Adding tools

In `src/index.ts`, call `server.tool(name, description, schema, handler)`:

```ts
server.tool(
  "my-tool",
  "What this tool does",
  { input: z.string() },
  async ({ input }) => ({
    content: [{ type: "text", text: `Result: ${input}` }],
  })
);
```

Rebuild and reconnect to pick up the change.
