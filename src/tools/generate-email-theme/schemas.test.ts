import { describe, it, expect } from 'vitest';
import { hexColorSchema, httpsUrlSchema, webFontCssUrlSchema } from './schemas.js';

describe('hexColorSchema', () => {
  it('accepts valid 6-digit hex', () => {
    expect(hexColorSchema.safeParse('#1D4ED8').success).toBe(true);
    expect(hexColorSchema.safeParse('#ffffff').success).toBe(true);
    expect(hexColorSchema.safeParse('#FFFFFF').success).toBe(true);
    expect(hexColorSchema.safeParse('#000000').success).toBe(true);
  });

  it('rejects missing #', () => {
    expect(hexColorSchema.safeParse('1D4ED8').success).toBe(false);
  });

  it('rejects 3-digit shorthand', () => {
    expect(hexColorSchema.safeParse('#FFF').success).toBe(false);
  });

  it('rejects 8-digit hex', () => {
    expect(hexColorSchema.safeParse('#FFFFFFFF').success).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(hexColorSchema.safeParse('#ZZZZZZ').success).toBe(false);
  });
});

describe('httpsUrlSchema', () => {
  it('accepts https URLs', () => {
    expect(httpsUrlSchema.safeParse('https://example.com/logo.png').success).toBe(true);
    expect(httpsUrlSchema.safeParse('https://cdn.example.com/img/logo.svg').success).toBe(true);
  });

  it('rejects http URLs', () => {
    expect(httpsUrlSchema.safeParse('http://example.com/logo.png').success).toBe(false);
  });

  it('rejects non-URL strings', () => {
    expect(httpsUrlSchema.safeParse('not-a-url').success).toBe(false);
  });
});

describe('webFontCssUrlSchema', () => {
  it('accepts a Google Fonts CSS endpoint', () => {
    expect(webFontCssUrlSchema.safeParse('https://fonts.googleapis.com/css?family=Lato').success).toBe(true);
    expect(webFontCssUrlSchema.safeParse('https://fonts.googleapis.com/css?family=Open+Sans').success).toBe(true);
    expect(webFontCssUrlSchema.safeParse('https://fonts.googleapis.com/css2?family=Lato:wght@400').success).toBe(true);
  });

  it('rejects a Google Fonts specimen page URL', () => {
    expect(webFontCssUrlSchema.safeParse('https://fonts.google.com/specimen/Lato').success).toBe(false);
  });

  it('rejects http URLs', () => {
    expect(webFontCssUrlSchema.safeParse('http://fonts.googleapis.com/css?family=Lato').success).toBe(false);
  });
});
