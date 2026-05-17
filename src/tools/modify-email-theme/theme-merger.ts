import type { EmailTheme, EmailThemePatch, EmailThemeFontStyle, EmailThemeFontStyleType } from '@rulecom/sdk';

export function mergeThemePatch(base: EmailTheme, patch: EmailThemePatch): EmailTheme {
  const colors = { ...base.colors };
  for (const color of patch.colors ?? []) {
    colors[color.type] = color;
  }

  const links = { ...base.links };
  for (const link of patch.links ?? []) {
    links[link.type] = link;
  }

  const images = { ...base.images };
  for (const image of patch.images ?? []) {
    images[image.type] = image;
  }

  const fonts = patch.fonts !== undefined ? [...patch.fonts] : [...base.fonts];

  const fontStyles = { ...base.fontStyles } as Record<EmailThemeFontStyleType, EmailThemeFontStyle>;
  for (const partialStyle of patch.fontStyles ?? []) {
    const { type, ...rest } = partialStyle;
    if (type !== undefined) {
      fontStyles[type] = { ...base.fontStyles[type], ...rest } as EmailThemeFontStyle;
    }
  }

  return {
    brandStyleId: patch.brandStyleId ?? base.brandStyleId,
    colors,
    links,
    images,
    fonts,
    fontStyles,
  };
}
