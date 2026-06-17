import { z } from 'zod';

export const inputSchemaShape = {
  brandStyleId: z.number().int().describe(
    'Brand style ID used to build the default email template. Required.'
  ),
  name: z.string().optional().describe(
    'Campaign name. If omitted, Rule generates a name automatically.'
  ),
  sendoutType: z.enum(['marketing', 'transactional']).optional().describe(
    'Sendout type. "marketing" (default) = standard marketing email. "transactional" = triggered transactional email.'
  ),
  message: z.object({
    subject: z.string().optional().describe('Email subject line. Defaults to the campaign name.'),
    fromName: z.string().optional().describe('Sender display name, e.g. "Jane from Acme".'),
    fromEmail: z.string().optional().describe('Sender email address.'),
    preheader: z.string().optional().describe('Short preview text shown in inbox previews.'),
  }).optional().describe('Optional overrides for the auto-created email message.'),
  template: z.object({
    name: z.string().optional().describe('Template name. Defaults to "Campaign <id> template".'),
    content: z.record(z.string(), z.unknown()).optional().describe(
      'Custom RcmlDocument JSON. When provided, skips auto-generating a branded template from brandStyleId.'
    ),
  }).optional().describe('Optional overrides for the auto-created email template.'),
};
