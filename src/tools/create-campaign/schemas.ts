import { z } from 'zod';

export const inputSchemaShape = {
  name: z.string().optional().describe(
    'Campaign name. If omitted, Rule generates a name automatically.'
  ),
  sendoutType: z.enum(['marketing', 'transactional']).optional().describe(
    'Sendout type. "marketing" (default) = standard marketing email. "transactional" = triggered transactional email.'
  ),
};
