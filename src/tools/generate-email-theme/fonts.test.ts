import { vi, describe, it, expect, afterEach } from 'vitest';
import {
  isSystemFont,
  detectFallback,
  parseGoogleFontsCssFamily,
  parseFontFamiliesFromCss,
  fetchFontFamiliesFromCss,
  validateFontArgs,
} from './fonts.js';

afterEach(() => vi.unstubAllGlobals());

function mockFetch(css: string, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, text: async () => css }));
}

function mockFetchError() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
}

// ─── detectFallback ───────────────────────────────────────────────────────────

describe('detectFallback', () => {
  it('returns sans-serif for undefined', () => {
    expect(detectFallback(undefined)).toBe('sans-serif');
  });

  it('returns sans-serif for unmapped system fonts', () => {
    expect(detectFallback('Arial')).toBe('sans-serif');
    expect(detectFallback('Verdana')).toBe('sans-serif');
  });

  it('returns serif for Georgia, Garamond, TimesNewRoman', () => {
    expect(detectFallback('Georgia')).toBe('serif');
    expect(detectFallback('Garamond')).toBe('serif');
    expect(detectFallback('TimesNewRoman')).toBe('serif');
  });

  it('returns monospace for CourierNew', () => {
    expect(detectFallback('CourierNew')).toBe('monospace');
  });

  it('returns cursive for BrushScriptMT', () => {
    expect(detectFallback('BrushScriptMT')).toBe('cursive');
  });
});

// ─── isSystemFont ─────────────────────────────────────────────────────────────

describe('isSystemFont', () => {
  it('recognises all supported system fonts', () => {
    expect(isSystemFont('Arial')).toBe(true);
    expect(isSystemFont('Georgia')).toBe(true);
    expect(isSystemFont('CourierNew')).toBe(true);
  });

  it('rejects unknown fonts', () => {
    expect(isSystemFont('Lato')).toBe(false);
    expect(isSystemFont('Inter')).toBe(false);
    expect(isSystemFont('Comic Sans')).toBe(false);
  });
});

// ─── parseGoogleFontsCssFamily ────────────────────────────────────────────────

describe('parseGoogleFontsCssFamily', () => {
  it('parses a simple family name', () => {
    expect(parseGoogleFontsCssFamily('https://fonts.googleapis.com/css?family=Lato')).toBe('Lato');
  });

  it('decodes + as space in family name', () => {
    expect(parseGoogleFontsCssFamily('https://fonts.googleapis.com/css?family=Open+Sans')).toBe('Open Sans');
  });

  it('strips weight variants in css2 format', () => {
    expect(parseGoogleFontsCssFamily('https://fonts.googleapis.com/css2?family=Lato:wght@400;700')).toBe('Lato');
  });

  it('returns null for non-Google-Fonts URLs', () => {
    expect(parseGoogleFontsCssFamily('https://example.com/font.css')).toBeNull();
  });

  it('returns null for Google Fonts specimen page', () => {
    expect(parseGoogleFontsCssFamily('https://fonts.google.com/specimen/Lato')).toBeNull();
  });

  it('returns null for an invalid URL string', () => {
    expect(parseGoogleFontsCssFamily('not-a-url')).toBeNull();
  });

  it('returns null for googleapis URL with path not starting with /css', () => {
    expect(parseGoogleFontsCssFamily('https://fonts.googleapis.com/icon?family=Material+Icons')).toBeNull();
  });

  it('returns null for googleapis /css URL without family param', () => {
    expect(parseGoogleFontsCssFamily('https://fonts.googleapis.com/css')).toBeNull();
  });
});

// ─── parseFontFamiliesFromCss ─────────────────────────────────────────────────

describe('parseFontFamiliesFromCss', () => {
  it('extracts a single quoted family', () => {
    const css = `@font-face { font-family: 'Lato'; src: url(...); }`;
    expect(parseFontFamiliesFromCss(css)).toEqual(['Lato']);
  });

  it('extracts a double-quoted family', () => {
    const css = `@font-face { font-family: "Open Sans"; src: url(...); }`;
    expect(parseFontFamiliesFromCss(css)).toEqual(['Open Sans']);
  });

  it('extracts an unquoted family', () => {
    const css = `@font-face { font-family: Roboto; src: url(...); }`;
    expect(parseFontFamiliesFromCss(css)).toEqual(['Roboto']);
  });

  it('extracts families from multiple @font-face blocks', () => {
    const css = `
      @font-face { font-family: 'Lato'; src: url(...); }
      @font-face { font-family: 'Lato'; font-weight: 700; src: url(...); }
    `;
    expect(parseFontFamiliesFromCss(css)).toEqual(['Lato', 'Lato']);
  });

  it('returns empty array when no @font-face found', () => {
    expect(parseFontFamiliesFromCss('body { color: red; }')).toEqual([]);
  });

  it('skips @font-face blocks with no font-family declaration', () => {
    const css = `@font-face { src: url(font.woff2); }`;
    expect(parseFontFamiliesFromCss(css)).toEqual([]);
  });
});

// ─── fetchFontFamiliesFromCss ─────────────────────────────────────────────────

describe('fetchFontFamiliesFromCss', () => {
  it('returns parsed families on a successful fetch', async () => {
    mockFetch(`@font-face { font-family: 'Lato'; src: url(...); }`);
    const result = await fetchFontFamiliesFromCss('https://fonts.googleapis.com/css?family=Lato');
    expect(result).toEqual(['Lato']);
  });

  it('returns null on network error', async () => {
    mockFetchError();
    const result = await fetchFontFamiliesFromCss('https://fonts.googleapis.com/css?family=Lato');
    expect(result).toBeNull();
  });

  it('returns null on non-200 response', async () => {
    mockFetch('', false);
    const result = await fetchFontFamiliesFromCss('https://fonts.googleapis.com/css?family=Lato');
    expect(result).toBeNull();
  });
});

// ─── validateFontArgs ─────────────────────────────────────────────────────────

describe('validateFontArgs', () => {
  it('returns ok for a system font without URL', async () => {
    expect(await validateFontArgs('Georgia', undefined)).toEqual({ kind: 'ok' });
    expect(await validateFontArgs('Arial', undefined)).toEqual({ kind: 'ok' });
  });

  it('returns ok when both omitted', async () => {
    expect(await validateFontArgs(undefined, undefined)).toEqual({ kind: 'ok' });
  });

  it('returns error when URL provided without fontFamily', async () => {
    const result = await validateFontArgs(undefined, 'https://fonts.googleapis.com/css?family=Lato');
    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toMatch(/fontFamily is missing/);
  });

  it('returns error for non-system font without URL', async () => {
    const result = await validateFontArgs('Lato', undefined);
    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toMatch(/not a supported system font/);
  });

  it('returns ok when font family is found in fetched CSS', async () => {
    mockFetch(`@font-face { font-family: 'Lato'; src: url(...); }`);
    const result = await validateFontArgs('Lato', 'https://fonts.googleapis.com/css?family=Lato');
    expect(result).toEqual({ kind: 'ok' });
  });

  it('returns error when font family is not in fetched CSS', async () => {
    mockFetch(`@font-face { font-family: 'Open Sans'; src: url(...); }`);
    const result = await validateFontArgs('Lato', 'https://fonts.googleapis.com/css?family=Open+Sans');
    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toMatch(/not found in the CSS/);
    expect(result.kind === 'error' && result.message).toMatch(/Open Sans/);
  });

  it('reports (none found) when CSS has no @font-face declarations', async () => {
    mockFetch('body { color: red; }');
    const result = await validateFontArgs('Lato', 'https://fonts.googleapis.com/css?family=Lato');
    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toMatch(/\(none found\)/);
  });

  it('returns warning when fetch fails', async () => {
    mockFetchError();
    const result = await validateFontArgs('Lato', 'https://fonts.googleapis.com/css?family=Lato');
    expect(result.kind).toBe('warning');
    expect(result.kind === 'warning' && result.message).toMatch(/Could not fetch/);
  });

  it('returns warning on non-200 response', async () => {
    mockFetch('', false);
    const result = await validateFontArgs('Lato', 'https://fonts.googleapis.com/css?family=Lato');
    expect(result.kind).toBe('warning');
  });

  it('works with non-Google web font URLs', async () => {
    mockFetch(`@font-face { font-family: 'MyFont'; src: url(...); }`);
    const result = await validateFontArgs('MyFont', 'https://cdn.example.com/myfont.css');
    expect(result).toEqual({ kind: 'ok' });
  });
});
