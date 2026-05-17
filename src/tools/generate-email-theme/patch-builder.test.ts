import { describe, it, expect } from 'vitest';
import { buildPatch } from './patch-builder.js';
import { EmailThemeColorType, EmailThemeFontStyleType, EmailThemeImageType } from '@rulecom/sdk';

const base = { description: 'test' };

// ─── colors ───────────────────────────────────────────────────────────────────

describe('buildPatch colors', () => {
  it('returns undefined colors when none provided', () => {
    expect(buildPatch(base).colors).toBeUndefined();
  });

  it('maps all four color fields', () => {
    const patch = buildPatch({
      ...base,
      bodyColor: '#111111',
      primaryColor: '#222222',
      secondaryColor: '#333333',
      backgroundColor: '#444444',
    });
    expect(patch.colors).toEqual([
      { type: EmailThemeColorType.Body, hex: '#111111' },
      { type: EmailThemeColorType.Primary, hex: '#222222' },
      { type: EmailThemeColorType.Secondary, hex: '#333333' },
      { type: EmailThemeColorType.Background, hex: '#444444' },
    ]);
  });

  it('maps only bodyColor when only that is provided', () => {
    const patch = buildPatch({ ...base, bodyColor: '#AABBCC' });
    expect(patch.colors).toEqual([{ type: EmailThemeColorType.Body, hex: '#AABBCC' }]);
  });
});

// ─── fonts / fontFamilyUrl ────────────────────────────────────────────────────

describe('buildPatch fonts', () => {
  it('returns undefined fonts when neither fontFamily nor fontFamilyUrl', () => {
    expect(buildPatch(base).fonts).toBeUndefined();
  });

  it('returns undefined fonts when only fontFamily (no URL)', () => {
    expect(buildPatch({ ...base, fontFamily: 'Arial' }).fonts).toBeUndefined();
  });

  it('builds fonts array when both fontFamily and fontFamilyUrl provided', () => {
    const patch = buildPatch({
      ...base,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(patch.fonts).toEqual([
      { fontFamily: 'Lato', url: 'https://fonts.googleapis.com/css?family=Lato' },
    ]);
  });
});

// ─── images ───────────────────────────────────────────────────────────────────

describe('buildPatch images', () => {
  it('returns undefined images when logoUrl absent', () => {
    expect(buildPatch(base).images).toBeUndefined();
  });

  it('builds logo image when logoUrl provided', () => {
    const patch = buildPatch({ ...base, logoUrl: 'https://example.com/logo.png' });
    expect(patch.images).toEqual([
      { type: EmailThemeImageType.Logo, url: 'https://example.com/logo.png' },
    ]);
  });
});

// ─── links ────────────────────────────────────────────────────────────────────

describe('buildPatch links', () => {
  it('returns undefined links when socialLinks absent', () => {
    expect(buildPatch(base).links).toBeUndefined();
  });

  it('forwards socialLinks as links', () => {
    const links = [{ type: 'facebook' as const, url: 'https://facebook.com/test' }];
    expect(buildPatch({ ...base, socialLinks: links }).links).toEqual(links);
  });
});

// ─── fontStyles ───────────────────────────────────────────────────────────────

describe('buildPatch fontStyles', () => {
  it('returns undefined when no font-related args', () => {
    expect(buildPatch(base).fontStyles).toBeUndefined();
  });

  it('applies fontFamily and auto-detects sans-serif fallback for Arial', () => {
    const styles = buildPatch({ ...base, fontFamily: 'Arial' }).fontStyles!;
    expect(styles).toHaveLength(6);
    expect(styles[0]).toMatchObject({ type: EmailThemeFontStyleType.Paragraph, fontFamily: 'Arial', fallbackFontFamily: 'sans-serif' });
  });

  it('auto-detects serif fallback for Georgia', () => {
    const styles = buildPatch({ ...base, fontFamily: 'Georgia' }).fontStyles!;
    expect(styles[0]).toMatchObject({ fontFamily: 'Georgia', fallbackFontFamily: 'serif' });
  });

  it('respects explicit fallbackFontFamily override', () => {
    const styles = buildPatch({ ...base, fontFamily: 'Arial', fallbackFontFamily: 'monospace' }).fontStyles!;
    expect(styles[0]).toMatchObject({ fallbackFontFamily: 'monospace' });
  });

  it('applies textColor to paragraph only (no headingColor)', () => {
    const styles = buildPatch({ ...base, textColor: '#FF0000' }).fontStyles!;
    const p = styles.find(s => s.type === EmailThemeFontStyleType.Paragraph)!;
    const h1 = styles.find(s => s.type === EmailThemeFontStyleType.H1)!;
    expect(p.color).toBe('#FF0000');
    // headingColor falls back to textColor when textColor is set
    expect(h1.color).toBe('#FF0000');
  });

  it('applies headingColor to H1-H4 independently of textColor', () => {
    const styles = buildPatch({ ...base, textColor: '#111111', headingColor: '#222222' }).fontStyles!;
    const p = styles.find(s => s.type === EmailThemeFontStyleType.Paragraph)!;
    const h1 = styles.find(s => s.type === EmailThemeFontStyleType.H1)!;
    expect(p.color).toBe('#111111');
    expect(h1.color).toBe('#222222');
  });

  it('headingColor only sets H1-H4 without paragraph', () => {
    const styles = buildPatch({ ...base, headingColor: '#ABCDEF' }).fontStyles!;
    const p = styles.find(s => s.type === EmailThemeFontStyleType.Paragraph);
    const h1 = styles.find(s => s.type === EmailThemeFontStyleType.H1)!;
    expect(p).toBeUndefined();
    expect(h1.color).toBe('#ABCDEF');
  });

  it('applies buttonTextColor only to ButtonLabel slot', () => {
    const styles = buildPatch({ ...base, buttonTextColor: '#FFFFFF' }).fontStyles!;
    expect(styles).toHaveLength(1);
    expect(styles[0]).toMatchObject({ type: EmailThemeFontStyleType.ButtonLabel, color: '#FFFFFF' });
  });

  it('filters out slots with only a type key (no payload)', () => {
    // fontFamily only — button label gets fontFamily but no color; should still be included
    const styles = buildPatch({ ...base, fontFamily: 'Arial' }).fontStyles!;
    // all 6 slots have fontFamily so all pass the filter
    expect(styles).toHaveLength(6);
  });

  it('excludes slots with no payload when only headingColor is set', () => {
    const styles = buildPatch({ ...base, headingColor: '#123456' }).fontStyles!;
    // Only H1-H4 (4 slots); paragraph and button have no payload
    expect(styles.every(s => s.color === '#123456')).toBe(true);
    expect(styles.map(s => s.type)).not.toContain(EmailThemeFontStyleType.Paragraph);
    expect(styles.map(s => s.type)).not.toContain(EmailThemeFontStyleType.ButtonLabel);
  });
});
