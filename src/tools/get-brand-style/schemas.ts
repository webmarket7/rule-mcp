import { z } from 'zod';

export const inputSchemaShape = {
  id: z.number().int().positive().optional().describe(
    'Brand style ID. If provided, fetches this specific brand style directly.'
  ),
  name: z.string().optional().describe(
    'Brand style name (case-insensitive). Searches the account\'s brand styles for a matching name. ' +
    'Ignored when id is provided.'
  ),
};
