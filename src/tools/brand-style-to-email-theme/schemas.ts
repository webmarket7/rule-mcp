import { z } from 'zod';

export const inputSchemaShape = {
  brandStyle: z.string().describe(
    'Brand style JSON as returned by the get-brand-style tool. ' +
    'Call get-brand-style first to retrieve the brand style, then pass its output here.'
  ),
};
