import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { rcmlSpec } from '@rulecom/sdk';

export function registerEmailRcmlSpecResource(server: McpServer): void {
  server.registerResource(
    'email-rcml-spec',
    'email-rcml://rcml-spec',
    {
      mimeType: 'application/json',
      description:
        'Machine-readable RCML tag specification. Lists every supported tag with its category, ' +
        'content rule (leaf / rcml-content / inline-rcml-content / children with allowedChildren), ' +
        'and all attributes with types, defaults, allowed values, and examples. ' +
        'Cross-reference content.type values with email-rcml://rfm-spec to understand what ' +
        'ProseMirror constructs are valid inside a given tag.',
    },
    async () => ({
      contents: [{
        uri: 'email-rcml://rcml-spec',
        mimeType: 'application/json',
        text: JSON.stringify(rcmlSpec, null, 2),
      }],
    })
  );
}
