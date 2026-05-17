import { z } from 'zod';

export const inputSchemaShape = {
  rcml: z.string().describe(
    'Validated RcmlDocument as a JSON string. Call generate-email-rcml-doc first to apply ' +
    'the theme and confirm the document is valid before passing it here.'
  ),
  name: z.string().describe(
    'Human-readable template name, e.g. "Summer Sale Email" or "Welcome Series — Day 1".'
  ),
};
