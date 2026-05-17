export const SYSTEM_FONTS = [
  'Arial', 'Verdana', 'Helvetica', 'Tahoma', 'TrebuchetMS',
  'TimesNewRoman', 'Georgia', 'Garamond', 'CourierNew', 'BrushScriptMT',
] as const;

export type SystemFont = typeof SYSTEM_FONTS[number];
type CssFontFallback = 'sans-serif' | 'serif' | 'monospace' | 'cursive';

const SYSTEM_FONT_FALLBACKS: Partial<Record<SystemFont, CssFontFallback>> = {
  TimesNewRoman: 'serif',
  Georgia: 'serif',
  Garamond: 'serif',
  CourierNew: 'monospace',
  BrushScriptMT: 'cursive',
};

export type FontValidationResult =
  | { kind: 'ok' }
  | { kind: 'error'; message: string }
  | { kind: 'warning'; message: string };

export function isSystemFont(name: string): name is SystemFont {
  return (SYSTEM_FONTS as readonly string[]).includes(name);
}

export function detectFallback(fontFamily: string | undefined): CssFontFallback {
  if (!fontFamily) return 'sans-serif';
  return SYSTEM_FONT_FALLBACKS[fontFamily as SystemFont] ?? 'sans-serif';
}

// Parses the font family name from a Google Fonts CSS endpoint URL.
// Returns null if the URL is not a recognisable Google Fonts CSS URL.
export function parseGoogleFontsCssFamily(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'fonts.googleapis.com') return null;
    if (!parsed.pathname.startsWith('/css')) return null;
    const family = parsed.searchParams.get('family');
    if (!family) return null;
    // css2 format: "Lato:wght@400;700" → "Lato"; URLSearchParams decodes + as space.
    return family.split(':')[0].trim();
  } catch {
    return null;
  }
}

export function parseFontFamiliesFromCss(css: string): string[] {
  const families: string[] = [];
  const fontFaceRegex = /@font-face\s*\{([^}]+)}/gi;
  let block: RegExpExecArray | null;
  while ((block = fontFaceRegex.exec(css)) !== null) {
    const m = /font-family\s*:\s*['"]?([^'";,\n]+?)['"]?\s*;/i.exec(block[1]);
    if (m) families.push(m[1].trim());
  }
  return families;
}

export async function fetchFontFamiliesFromCss(url: string): Promise<string[] | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return parseFontFamiliesFromCss(await res.text());
  } catch {
    return null;
  }
}

export async function validateFontArgs(
  fontFamily: string | undefined,
  fontFamilyUrl: string | undefined,
): Promise<FontValidationResult> {
  if (fontFamilyUrl && !fontFamily) {
    return { kind: 'error', message: 'fontFamilyUrl was provided, but fontFamily is missing. Provide both or omit both.' };
  }

  if (fontFamily && !fontFamilyUrl && !isSystemFont(fontFamily)) {
    const encoded = fontFamily.replace(/ /g, '+');
    return {
      kind: 'error',
      message:
        `Font family '${fontFamily}' is not a supported system font. ` +
        `Provide fontFamilyUrl, for example https://fonts.googleapis.com/css?family=${encoded}.`,
    };
  }

  if (fontFamily && fontFamilyUrl) {
    const families = await fetchFontFamiliesFromCss(fontFamilyUrl);
    if (families === null) {
      return {
        kind: 'warning',
        message: `Could not fetch font CSS from ${fontFamilyUrl}. Proceeding, but verify the URL returns valid @font-face CSS.`,
      };
    }
    if (!families.includes(fontFamily)) {
      return {
        kind: 'error',
        message:
          `Font family '${fontFamily}' was not found in the CSS returned by ${fontFamilyUrl}. ` +
          `Declared families: ${families.length ? families.join(', ') : '(none found)'}.`,
      };
    }
  }

  return { kind: 'ok' };
}
