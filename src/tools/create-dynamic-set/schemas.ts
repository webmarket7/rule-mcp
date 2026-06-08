import { z } from 'zod';

export const inputSchemaShape = {
  messageId: z.number().describe(
    'ID of the message this dynamic set belongs to. Use the ID returned by create-email-message.'
  ),
  templateId: z.number().optional().describe(
    'ID of the email template to attach. Use the ID returned by create-email-template. Can be set later via update.'
  ),
  name: z.string().optional().describe(
    'Name for this dynamic set. Defaults to "Default" if omitted.'
  ),
  active: z.boolean().optional().describe(
    'Whether this dynamic set should be active immediately. Defaults to true.'
  ),
};
