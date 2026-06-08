import { McpServer, RegisteredPrompt } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function registerPrompt(server: McpServer): RegisteredPrompt {
  return server.registerPrompt('create-email-campaign', {
    title: 'Create Email Campaign',
    description:
      'Full workflow: gather campaign details → fetch brand style → derive email theme → ' +
      'generate and validate RCML → publish template → create campaign → create message → ' +
      'create dynamic set → render and return HTML. Claude will ask the user for required ' +
      'details (campaign name, subject, sender, description, links) before starting.',
    argsSchema: {
      request: z.string().optional().describe(
        'Free-form description of the campaign to create. Used as context when gathering required inputs from the user.'
      ),
      brandStyleId: z.string().optional().describe(
        'Brand style ID (numeric) or name. Omit to use the account default.'
      ),
      links: z.string().optional().describe(
        'URLs for interactive elements — e.g. "CTA button: https://app.example.com/dashboard, ' +
        'Twitter: https://x.com/example". If omitted, Claude will ask the user.'
      ),
    },
  }, (args) => {
    const requestContext = args.request
      ? `\nThe user's original request was: "${args.request}" — use this as context when suggesting values for the fields below.`
      : '';

    const linksQuestion = args.links
      ? ''
      : '\n- **Links** (optional) — Product page or content URLs. These will be fetched to extract images and copy, and used as CTA link destinations. They can skip this if they don\'t have them yet.';

    const gatherInputs =
      `Before doing anything else, ask the user for the following and wait for their answers:\n` +
      `- **Campaign name** — what should this campaign be called in Rule?\n` +
      `- **Template name** — what should the email template be called? (can be the same as campaign name)\n` +
      `- **Email subject** — the subject line recipients will see\n` +
      `- **From name** (optional) — sender display name, e.g. "Jane from Acme"\n` +
      `- **From email** (optional) — sender email address\n` +
      `- **Description** — what is this email for, and what should it contain?` +
      linksQuestion +
      requestContext;

    const brandStyleStep = args.brandStyleId
      ? `Call \`get-brand-style\` with \`id\` set to \`${args.brandStyleId}\`.`
      : 'Call `get-brand-style` with no arguments to fetch the default brand style.';

    const linksInstruction = args.links
      ? `The following URLs have been provided for interactive elements — use them when setting \`href\` attributes:\n${args.links}`
      : 'Use the links provided by the user in step 0. If they skipped links, omit `href` attributes.';

    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create a complete Rule email campaign for the user.

Follow these steps in order:

0. ${gatherInputs}
1. Read the \`email-rcml://generation-guide\` resource — use it as your reference for all RCML structure and element rules throughout this workflow.
2. ${brandStyleStep}
3. Call \`brand-style-to-email-theme\` with the brand style JSON from step 2 to derive the email theme.
3a. If the user provided any product or content URLs (in their original request or in the links they supplied), use WebFetch on each URL to extract:
    - Product image URLs — use these as \`src\` on \`rc-image\` elements so subscribers can see the product
    - Product name, description, key features, and pricing — use this to write accurate copy
    - Any other content relevant to the email
    Do this before writing any RCML. If a page contains multiple product images, pick the best one or two for the email layout.
    If no URLs were provided, or fetching did not yield usable image URLs, use \`https://app.rule.io/img/editor/image.png\` as the \`src\` for any \`rc-image\` elements — never omit images from the layout just because real URLs are unavailable.
4. Using the generation guide from step 1, the theme from step 3, and any content fetched in step 3a, generate an \`RcmlDocument\` JSON that matches the description provided by the user. ${linksInstruction}
5. Call \`generate-email-rcml-doc\` with your RCML and the theme. If it returns validation errors, fix the RCML and call it again — repeat until you receive a valid document.
6. Call \`create-email-template\` with the validated RCML and the template name the user provided. Note the returned template ID.
7. Call \`create-campaign\` with the campaign name the user provided. Note the returned campaign ID.
8. Call \`create-email-message\` with:
   - \`campaignId\` — the campaign ID from step 7
   - \`subject\` — the email subject the user provided
   - \`fromName\` — the from name the user provided (if any)
   - \`fromEmail\` — the from email the user provided (if any)
   Note the returned message ID.
9. Call \`create-dynamic-set\` with:
   - \`messageId\` — the message ID from step 8
   - \`templateId\` — the template ID from step 6
   This wires the template to the message so it will be sent.
10. Call \`render-email-template\` with the template ID from step 6.
11. Write the rendered HTML to a temporary directory as \`index.html\`, then publish it with surge by running:
      surge <tmpdir> <slug>.surge.sh
    where <slug> is the campaign name (slugified, spaces → hyphens, lowercase) plus a Unix timestamp suffix for uniqueness (e.g. \`${slug(args.request ?? 'campaign')}-1716070173\`).
12. Return the live URL (https://<slug>.surge.sh) to the user along with a summary: campaign ID, message ID, template ID, and dynamic set ID.`,
        },
      }],
    };
  });
}
