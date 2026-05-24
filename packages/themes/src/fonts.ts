const GOOGLE_FONT_NAMES = new Set([
  'Inter',
  'DM Sans',
  'Source Sans 3',
  'Playfair Display',
  'Nunito',
  'Outfit',
  'Manrope',
  'Space Grotesk',
  'Cormorant Garamond',
]);

export function extractPrimaryFontName(fontFamily: string): string | null {
  const quoted = fontFamily.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];

  const first = fontFamily.split(',')[0]?.trim();
  if (!first || first === 'system-ui' || first === 'sans-serif') {
    return null;
  }
  return first.replace(/^['"]|['"]$/g, '');
}

export function googleFontsStylesheetUrl(fontFamily: string): string | null {
  const fontName = extractPrimaryFontName(fontFamily);
  if (!fontName || fontName === 'Inter' || !GOOGLE_FONT_NAMES.has(fontName)) {
    return null;
  }

  const family = fontName.replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
}
