import { z } from 'zod';

export const inputSchemaShape = {
  id: z.number().int().positive().describe(
    'Template ID as returned by create-email-template.'
  ),
  subscriberId: z.number().int().positive().optional().describe(
    'Optional subscriber ID. When provided, merge tags (e.g. first name) are substituted ' +
    "with that subscriber's field values."
  ),
};
