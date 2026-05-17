import { z } from 'zod';
import { hexColorSchema, httpsUrlSchema, webFontCssUrlSchema } from '../generate-email-theme/schemas.js';

export const inputSchemaShape = {
  theme: z.string().describe(
    'EmailTheme JSON as returned by generate-email-theme or brand-style-to-email-theme. ' +
    'The provided overrides are applied on top of this theme.'
  ),
  bodyColor: hexColorSchema.optional().describe(
    'Section/content area background color (hex, e.g. "#FFFFFF").'
  ),
  primaryColor: hexColorSchema.optional().describe(
    'CTA button background color (hex).'
  ),
  secondaryColor: hexColorSchema.optional().describe(
    'Accent background color used in brand-highlighted sections (hex).'
  ),
  backgroundColor: hexColorSchema.optional().describe(
    'Outer email canvas background color (hex).'
  ),
  fontFamily: z.string().optional().describe(
    'Font family applied to ALL text slots. ' +
    'For system fonts, use one of the supported names and omit fontFamilyUrl: ' +
    'Arial, Verdana, Helvetica, Tahoma, TrebuchetMS, TimesNewRoman, Georgia, Garamond, CourierNew, BrushScriptMT. ' +
    'For web fonts, fontFamily must exactly match the font-family name declared inside the CSS returned by fontFamilyUrl.'
  ),
  fontFamilyUrl: webFontCssUrlSchema.optional().describe(
    'Direct CSS URL for the web font. Must return CSS containing @font-face declarations. ' +
    'For Google Fonts, use https://fonts.googleapis.com/css?family=Lato. ' +
    'If the font name contains spaces, encode spaces as +, e.g. https://fonts.googleapis.com/css?family=Open+Sans. ' +
    'Omit for system fonts.'
  ),
  fallbackFontFamily: z.enum(['sans-serif', 'serif', 'monospace', 'cursive']).optional().describe(
    'CSS generic font fallback. Auto-detected for system fonts if omitted.'
  ),
  textColor: hexColorSchema.optional().describe(
    'Body paragraph text color (hex).'
  ),
  headingColor: hexColorSchema.optional().describe(
    'Color applied to all headings H1–H4 (hex). Defaults to textColor when provided.'
  ),
  buttonTextColor: hexColorSchema.optional().describe(
    'Button label text color (hex).'
  ),
  socialLinks: z.array(z.object({
    type: z.enum(['facebook', 'instagram', 'linkedin', 'tiktok', 'x', 'website']),
    url: httpsUrlSchema,
  })).optional().describe('Social profile URLs to include in the theme.'),
  logoUrl: httpsUrlSchema.optional().describe(
    'Logo image URL (must be https://).'
  ),
};
