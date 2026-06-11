#!/usr/bin/env bun
/**
 * i18n-audit: cross-checks t("…") call sites against src/i18n/translations.ts.
 *
 *   - Errors on keys used in code but missing from any of {en, fr, ar}.
 *   - Errors on keys present in translations but where ar === en (likely
 *     un-translated copy-paste).
 *   - Warns on keys defined but never referenced in code.
 *
 * Usage: bun scripts/i18n-audit.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

// Load translations.ts and extract keys + AR/EN equality via runtime import.
// translations.ts has no side effects (pure data), safe to dynamic-import.
const mod = await import(join(SRC, "i18n/translations.ts"));
const T: Record<string, { en: string; fr: string; ar: string }> = mod.T;
const defined = new Set(Object.keys(T));

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(p);
  }
  return out;
}

const used = new Map<string, string[]>(); // key -> files
for (const f of walk(SRC)) {
  if (f.endsWith("translations.ts")) continue;
  const src = readFileSync(f, "utf8");
  const re = /\bt\(\s*["'`]([a-zA-Z0-9_.-]+)["'`]\s*[),]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const k = m[1];
    if (!used.has(k)) used.set(k, []);
    used.get(k)!.push(relative(ROOT, f));
  }
}

const missing: string[] = [];
const untranslated: string[] = [];
const unused: string[] = [];

for (const k of used.keys()) {
  if (!defined.has(k)) missing.push(k);
}
for (const k of defined) {
  const entry = T[k];
  if (!entry.en || !entry.fr || !entry.ar) {
    untranslated.push(`${k}  [missing ${["en","fr","ar"].filter((l) => !entry[l as keyof typeof entry]).join(",")}]`);
  } else if (entry.ar === entry.en && /[A-Za-z]{3,}/.test(entry.ar)) {
    untranslated.push(`${k}  [ar === en → likely not translated]`);
  }
  if (!used.has(k)) unused.push(k);
}

let exitCode = 0;
if (missing.length) {
  console.error(`✗ ${missing.length} key(s) used in code but MISSING from translations.ts:`);
  for (const k of missing) {
    console.error(`  ${k}   (used in: ${used.get(k)!.slice(0, 3).join(", ")}${used.get(k)!.length > 3 ? ", …" : ""})`);
  }
  exitCode = 1;
}
if (untranslated.length) {
  console.error(`\n✗ ${untranslated.length} key(s) with missing or untranslated Arabic:`);
  for (const k of untranslated) console.error(`  ${k}`);
  exitCode = 1;
}
if (unused.length) {
  console.warn(`\n⚠ ${unused.length} key(s) defined but never referenced (warning only):`);
  for (const k of unused.slice(0, 30)) console.warn(`  ${k}`);
  if (unused.length > 30) console.warn(`  …and ${unused.length - 30} more`);
}

if (exitCode === 0) {
  console.log(`✓ i18n-audit: ${defined.size} keys, ${used.size} used, all three locales present.`);
}
process.exit(exitCode);
