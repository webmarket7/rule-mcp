import { describe, it, expect } from 'vitest';
import { mergeThemePatch } from './theme-merger.js';
import { createEmailTheme, EmailThemeColorType, EmailThemeFontStyleType, EmailThemeImageType } from '@rulecom/sdk';

const base = createEmailTheme();

describe('mergeThemePatch', () => {
  it('returns a theme equal to base when patch is empty', () => {
    const result = mergeThemePatch(base, {});
    expect(result.colors).toEqual(base.colors);
    expect(result.fontStyles).toEqual(base.fontStyles);
    expect(result.fonts).toEqual([...base.fonts]);
    expect(result.links).toEqual(base.links);
    expect(result.images).toEqual(base.images);
  });

  it('overrides a single color slot', () => {
    const result = mergeThemePatch(base, {
      colors: [{ type: EmailThemeColorType.Primary, hex: '#FF0000' }],
    });
    expect(result.colors[EmailThemeColorType.Primary]?.hex).toBe('#FF0000');
    expect(result.colors[EmailThemeColorType.Body]?.hex).toBe(base.colors[EmailThemeColorType.Body]?.hex);
  });

  it('overrides multiple color slots independently', () => {
    const result = mergeThemePatch(base, {
      colors: [
        { type: EmailThemeColorType.Body, hex: '#111111' },
        { type: EmailThemeColorType.Background, hex: '#222222' },
      ],
    });
    expect(result.colors[EmailThemeColorType.Body]?.hex).toBe('#111111');
    expect(result.colors[EmailThemeColorType.Background]?.hex).toBe('#222222');
    expect(result.colors[EmailThemeColorType.Primary]?.hex).toBe(base.colors[EmailThemeColorType.Primary]?.hex);
  });

  it('overrides only the specified fontStyle fields', () => {
    const result = mergeThemePatch(base, {
      fontStyles: [{ type: EmailThemeFontStyleType.Paragraph, color: '#FF0000' }],
    });
    const pStyle = result.fontStyles[EmailThemeFontStyleType.Paragraph];
    expect(pStyle.color).toBe('#FF0000');
    expect(pStyle.fontFamily).toBe(base.fontStyles[EmailThemeFontStyleType.Paragraph].fontFamily);
    expect(pStyle.fontSize).toBe(base.fontStyles[EmailThemeFontStyleType.Paragraph].fontSize);
  });

  it('replaces fonts when patch.fonts is provided', () => {
    const result = mergeThemePatch(base, {
      fonts: [{ fontFamily: 'Lato', url: 'https://fonts.googleapis.com/css?family=Lato' }],
    });
    expect(result.fonts).toHaveLength(1);
    expect(result.fonts[0].fontFamily).toBe('Lato');
  });

  it('keeps base fonts when patch.fonts is undefined', () => {
    const baseWithFont = mergeThemePatch(base, {
      fonts: [{ fontFamily: 'Lato', url: 'https://fonts.googleapis.com/css?family=Lato' }],
    });
    const result = mergeThemePatch(baseWithFont, { colors: [] });
    expect(result.fonts).toHaveLength(1);
    expect(result.fonts[0].fontFamily).toBe('Lato');
  });

  it('overrides a link slot', () => {
    const result = mergeThemePatch(base, {
      links: [{ type: 'facebook', url: 'https://facebook.com/acme' }],
    });
    expect(result.links['facebook']?.url).toBe('https://facebook.com/acme');
  });

  it('sets an image slot', () => {
    const result = mergeThemePatch(base, {
      images: [{ type: EmailThemeImageType.Logo, url: 'https://example.com/logo.png' }],
    });
    expect(result.images[EmailThemeImageType.Logo]?.url).toBe('https://example.com/logo.png');
  });

  it('does not mutate the base theme', () => {
    const originalPrimary = base.colors[EmailThemeColorType.Primary]?.hex;
    mergeThemePatch(base, {
      colors: [{ type: EmailThemeColorType.Primary, hex: '#ABCDEF' }],
    });
    expect(base.colors[EmailThemeColorType.Primary]?.hex).toBe(originalPrimary);
  });
});
