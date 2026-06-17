import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { emailRfmSpec } from '@rulecom/sdk';

export function registerEmailRfmSpecResource(server: McpServer): void {
  server.registerResource(
    'email-rfm-spec',
    'email-rcml://rfm-spec',
    {
      mimeType: 'application/json',
      description:
        'Machine-readable RFM (ProseMirror content) specification. Describes the two content flavors ' +
        '("rcml-content" for rc-text/rc-heading and "inline-rcml-content" for rc-button), including ' +
        'which block nodes, inline nodes, and marks each flavor permits. Also documents every node ' +
        'type (paragraph, bullet-list, ordered-list, list-item, align, hardbreak, text, placeholder, ' +
        'loop-value) and mark type (font, link) with their attributes. ' +
        'Flavor keys match the content.type values in email-rcml://rcml-spec. ' +
        'The placeholder node\'s type attribute allowedValues map to token types in email-rcml://placeholder-spec.',
    },
    async () => ({
      contents: [{
        uri: 'email-rcml://rfm-spec',
        mimeType: 'application/json',
        text: JSON.stringify(emailRfmSpec, null, 2),
      }],
    })
  );
}
