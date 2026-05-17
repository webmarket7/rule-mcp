import { z } from 'zod';

export const inputSchemaShape = {
  rcml: z.string().describe(
    'RcmlDocument as a JSON string. Read email-rcml://generation-guide before generating ' +
    'this document — it contains the full element reference, ProseMirror content format, ' +
    'attribute values, and layout examples.'
  ),
  theme: z.string().describe(
    'EmailTheme JSON as returned by generate-email-theme, brand-style-to-email-theme, or ' +
    'modify-email-theme. The theme is applied to the RCML before validation.'
  ),
};
