# rule-mcp

An MCP (Model Context Protocol) server that exposes [Rule](https://www.rule.io/) email marketing capabilities as tools, resources, and prompts for Claude. Use it to build and publish email templates, create campaigns, and wire everything together — directly from a Claude conversation.

## Prerequisites

- Node.js 18 or later
- A Rule account with an API key. Find yours at **Rule Dashboard → Settings → API keys**.

## Installation

```bash
git clone https://github.com/your-org/rule-mcp.git
cd rule-mcp
npm install
npm run build
```

## Configuration

The server reads one environment variable:

| Variable | Description |
|----------|-------------|
| `RULECOM_API_KEY` | Your Rule API key |

## Connecting to Claude Code (project-scoped)

This repo includes a `.mcp.json` file that registers the server automatically whenever Claude Code is opened in this directory — no global installation needed.

Set your API key in the environment before starting Claude Code:

```bash
export RULECOM_API_KEY=<your-key>
```

Then open Claude Code in this directory. The server loads automatically. Verify with `/mcp` inside the session.

To persist the key across terminal sessions, add the `export` line to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.).

## Connecting to Claude Code (global)

If you want the server available in all Claude Code sessions regardless of directory, register it globally:

```bash
claude mcp add rule-mcp \
  -e RULECOM_API_KEY=<your-key> \
  node /absolute/path/to/rule-mcp/dist/index.js
```

## Connecting to Claude Desktop

Add the following to your `claude_desktop_config.json`. Replace the path with the absolute path to this repo on your machine.

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rule-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/rule-mcp/dist/index.js"],
      "env": {
        "RULECOM_API_KEY": "<your-key>"
      }
    }
  }
}
```

Restart Claude Desktop to pick up the change.

## Available tools

| Tool | Description | Key inputs |
|------|-------------|------------|
| `get-brand-style` | Fetch a brand style from your Rule account | `id` or `name` (omit for account default) |
| `generate-email-theme` | Generate a typed EmailTheme from style parameters | `description`, colors, fonts, logo, social links |
| `brand-style-to-email-theme` | Convert a brand style JSON to an EmailTheme | `brandStyle` JSON |
| `modify-email-theme` | Override specific slots on an existing theme | existing theme + any field to change |
| `generate-email-rcml-doc` | Apply a theme to an RCML document and validate it | `rcml`, `theme` |
| `create-email-template` | Publish a validated RCML document as a Rule template | `rcml`, `name` |
| `render-email-template` | Render a template to HTML for previewing | `id`, optional `subscriberId` |
| `create-campaign` | Create a new email campaign | `name` (optional), `sendoutType` |
| `create-email-message` | Create a message (subject + sender) attached to a campaign | `campaignId`, `subject`, sender fields |
| `create-dynamic-set` | Wire a template to a message to complete campaign setup | `messageId`, `templateId` |

## Available resources

Resources are reference documents that Claude reads during template and campaign workflows.

| Resource URI | Contents |
|---|---|
| `email-rcml://generation-guide` | Full RCML element reference, layout patterns, and content format rules |
| `email-theme://design-guide` | Color semantics, typography guidance, and WCAG contrast rules |
| `email-theme://defaults` | Default theme values and all available enum types |

## Available prompts

Prompts are pre-built workflows that orchestrate multiple tools in sequence.

### `create-email-template`

Builds and publishes an email template, then deploys an HTML preview. Steps:

1. Asks the user for template name, description, and optional links
2. Fetches the brand style and derives an email theme
3. Fetches content from any provided URLs (images, copy)
4. Generates and validates an RCML document (iterates until clean)
5. Publishes the template to Rule
6. Renders the template and deploys a live preview via [surge](https://surge.sh/)

### `create-email-campaign`

Full end-to-end campaign setup. Does everything `create-email-template` does, then:

7. Creates a campaign in Rule
8. Creates an email message (subject line, sender details)
9. Creates a dynamic set to wire the template to the message
10. Returns a summary with all created IDs and a live preview URL

## Example prompts

```
Use the create-email-campaign prompt to create a summer sale campaign
```

```
Create a transactional email campaign called "Order Confirmation" with subject "Your order is confirmed"
```

```
Fetch my default brand style and build a welcome email template for new subscribers
```

## Development

Watch mode rebuilds on save:

```bash
npm run dev
```

After each rebuild, reload the server in Claude Code:

```
/mcp
```

Run the test suite:

```bash
npm test
```
