import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { placeholderSpec } from '@rulecom/sdk';

export function registerEmailPlaceholderSpecResource(server: McpServer): void {
  server.registerResource(
    'email-placeholder-spec',
    'email-rcml://placeholder-spec',
    {
      mimeType: 'application/json',
      description:
        'Machine-readable placeholder (personalization token) specification. Describes every backend ' +
        'token type the Rule.io renderer substitutes at send time: CustomField, Subscriber, User, Date, ' +
        'RemoteContent, LoopValue, Link, RandomString, Dispatcher, PromoCode. ' +
        'Each entry includes a description, syntax pattern, parameter definitions, and examples. ' +
        'Use the "original" field of ::placeholder and ::loop-value RFM nodes (see email-rcml://rfm-spec) ' +
        'to embed these tokens in rich-text content. Tokens also appear directly in RCML attribute ' +
        'values such as link href and custom attributes.',
    },
    async () => ({
      contents: [{
        uri: 'email-rcml://placeholder-spec',
        mimeType: 'application/json',
        text: JSON.stringify(placeholderSpec, null, 2),
      }],
    })
  );
}
