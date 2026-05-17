import { z } from 'zod';
import {
  EmailThemeColorType,
  EmailThemeFontStyleType,
  EmailThemeImageType,
  type EmailThemePatch,
} from '@rulecom/sdk';
import { hexColorSchema, httpsUrlSchema, webFontCssUrlSchema } from './schemas.js';
import { detectFallback } from './fonts.js';

const inputSchemaShape = {
  description: z.string().describe(
    'Natural language description of the desired theme style, e.g. "dark corporate with blue accents"'
  ),
  bodyColor: hexColorSchema.optional().describe(
    'Section/content area background color (hex, e.g. "#FFFFFF"). Defaults to #FFFFFF.'
  ),
  primaryColor: hexColorSchema.optional().describe(
    'CTA button background color (hex). Defaults to #05CC87.'
  ),
  secondaryColor: hexColorSchema.optional().describe(
    'Accent background color used in brand-highlighted sections (hex). Defaults to #F6F8F9.'
  ),
  backgroundColor: hexColorSchema.optional().describe(
    'Outer email canvas background color (hex). Defaults to #F3F3F3.'
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
    'The font-family inside the returned @font-face CSS must exactly match fontFamily. ' +
    'Do not use Google Fonts specimen URLs like https://fonts.google.com/specimen/Lato. ' +
    'Omit for system fonts.'
  ),
  fallbackFontFamily: z.enum(['sans-serif', 'serif', 'monospace', 'cursive']).optional().describe(
    'CSS generic font fallback. Auto-detected for system fonts if omitted.'
  ),
  textColor: hexColorSchema.optional().describe(
    'Body paragraph text color (hex). Defaults to #0F0F1F.'
  ),
  headingColor: hexColorSchema.optional().describe(
    'Color applied to all headings H1–H4 (hex). Defaults to textColor when provided.'
  ),
  buttonTextColor: hexColorSchema.optional().describe(
    'Button label text color (hex). Defaults to #FFFFFF (white).'
  ),
  socialLinks: z.array(z.object({
    type: z.enum(['facebook', 'instagram', 'linkedin', 'tiktok', 'x', 'website']),
    url: httpsUrlSchema,
  })).optional().describe('Social profile URLs to include in the theme.'),
  logoUrl: httpsUrlSchema.optional().describe(
    'Logo image URL (must be https://).'
  ),
};

const inputSchemaObject = z.object(inputSchemaShape);
export type Input = z.infer<typeof inputSchemaObject>;
export { inputSchemaShape };

function buildColors(args: Input): EmailThemePatch['colors'] {
  const entries: EmailThemePatch['colors'] = [];
  if (args.bodyColor) entries.push({ type: EmailThemeColorType.Body, hex: args.bodyColor });
  if (args.primaryColor) entries.push({ type: EmailThemeColorType.Primary, hex: args.primaryColor });
  if (args.secondaryColor) entries.push({ type: EmailThemeColorType.Secondary, hex: args.secondaryColor });
  if (args.backgroundColor) entries.push({ type: EmailThemeColorType.Background, hex: args.backgroundColor });
  return entries.length > 0 ? entries : undefined;
}

function buildFontStyles(args: Input): EmailThemePatch['fontStyles'] {
  const { fontFamily, fallbackFontFamily, textColor, headingColor, buttonTextColor } = args;
  const resolvedFallback = fallbackFontFamily ?? detectFallback(fontFamily);
  const resolvedHeadingColor = headingColor ?? textColor;

  if (!fontFamily && !textColor && !headingColor && !buttonTextColor) return undefined;

  const base = fontFamily ? { fontFamily, fallbackFontFamily: resolvedFallback } : {};

  const slots: EmailThemePatch['fontStyles'] = [
    { type: EmailThemeFontStyleType.Paragraph, ...base, ...(textColor ? { color: textColor } : {}) },
    { type: EmailThemeFontStyleType.H1, ...base, ...(resolvedHeadingColor ? { color: resolvedHeadingColor } : {}) },
    { type: EmailThemeFontStyleType.H2, ...base, ...(resolvedHeadingColor ? { color: resolvedHeadingColor } : {}) },
    { type: EmailThemeFontStyleType.H3, ...base, ...(resolvedHeadingColor ? { color: resolvedHeadingColor } : {}) },
    { type: EmailThemeFontStyleType.H4, ...base, ...(resolvedHeadingColor ? { color: resolvedHeadingColor } : {}) },
    { type: EmailThemeFontStyleType.ButtonLabel, ...base, ...(buttonTextColor ? { color: buttonTextColor } : {}) },
  ];

  return slots.filter(s => Object.keys(s).length > 1);
}

export function buildPatch(args: Input): EmailThemePatch {
  return {
    colors: buildColors(args),
    fontStyles: buildFontStyles(args),
    fonts: args.fontFamily && args.fontFamilyUrl
      ? [{ fontFamily: args.fontFamily, url: args.fontFamilyUrl }]
      : undefined,
    links: args.socialLinks,
    images: args.logoUrl
      ? [{ type: EmailThemeImageType.Logo, url: args.logoUrl }]
      : undefined,
  };
}
