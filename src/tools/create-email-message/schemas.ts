import { z } from 'zod';

export const inputSchemaShape = {
  campaignId: z.number().int().positive().describe(
    'ID of the campaign to attach this message to. Use the ID returned by create-campaign.'
  ),
  subject: z.string().describe(
    'Email subject line shown to recipients.'
  ),
  preheader: z.string().optional().describe(
    'Short preview text shown in inbox previews.'
  ),
  fromName: z.string().optional().describe(
    'Display name of the sender, e.g. "Jane from Acme".'
  ),
  fromEmail: z.string().optional().describe(
    'Sender email address, e.g. "jane@acme.com".'
  ),
  utmCampaign: z.string().optional().describe(
    'UTM campaign parameter appended to tracked links.'
  ),
  utmTerm: z.string().optional().describe(
    'UTM term parameter appended to tracked links.'
  ),
};
