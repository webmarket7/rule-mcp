import { z } from 'zod';

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Expected a 6-digit hex color like #1D4ED8');

export const httpsUrlSchema = z
  .string()
  .url()
  .refine((v) => v.startsWith('https://'), { message: 'URL must start with https://' });

export const webFontCssUrlSchema = httpsUrlSchema.refine(
  (v) => !v.startsWith('https://fonts.google.com/specimen/'),
  {
    message:
      'fontFamilyUrl must be a direct CSS URL, not a Google Fonts specimen page. ' +
      'Use https://fonts.googleapis.com/css?family=FontName instead.',
  }
);
