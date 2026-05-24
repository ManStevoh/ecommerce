/**
 * Theme preset catalog tests.
 * Run: node scripts/test-themes.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const themes = require('../packages/themes/dist/index.js');

const { THEME_PRESETS, getThemePreset, resolveTheme, applyThemePreset, THEME_PRESET_SLUGS } = themes;

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

assert(THEME_PRESETS.length === 11, `expected 11 presets, got ${THEME_PRESETS.length}`);
assert(THEME_PRESET_SLUGS.length === new Set(THEME_PRESET_SLUGS).size, 'preset slugs must be unique');

const required = [
  'slug',
  'name',
  'description',
  'primaryColor',
  'accentColor',
  'buttonBackground',
  'heroGradient',
];

for (const preset of THEME_PRESETS) {
  for (const key of required) {
    assert(Boolean(preset[key]), `${preset.slug} missing ${key}`);
  }
  assert(getThemePreset(preset.slug)?.slug === preset.slug, `getThemePreset(${preset.slug})`);
}

const ocean = applyThemePreset('ocean');
assert(ocean.themePreset === 'ocean', 'applyThemePreset sets slug');
assert(ocean.accentColor === '#06b6d4', 'ocean accent color');

const resolved = resolveTheme({
  themePreset: 'forest',
  accentColor: '#22c55e',
});
assert(resolved.themePreset === 'forest', 'resolveTheme preset');
assert(resolved.cssVars['--tenant-accent'] === '#22c55e', 'resolveTheme css vars');
assert(resolved.cssVars['--tenant-btn-bg']?.includes('gradient'), 'button gradient var');

try {
  applyThemePreset('not-a-theme');
  assert(false, 'unknown preset should throw');
} catch {
  // expected
}

if (failed === 0) {
  console.log(`OK ${THEME_PRESETS.length} theme presets validated`);
  process.exit(0);
}

console.error(`${failed} theme test(s) failed`);
process.exit(1);
