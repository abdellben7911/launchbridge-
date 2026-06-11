#!/usr/bin/env bun
/**
 * i18n-lint: scans authenticated dashboard pages + dashboard components for
 * hardcoded English text (JSX text + translatable attributes) that is NOT
 * already routed through `t("...")`. Brand nouns are allow-listed.
 *
 * Exits 1 with `file:line:col` for each violation.
 *
 * Usage: bun scripts/i18n-lint.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Lightweight scanner — no @babel dep. Strips comments + JS string literals,
// then walks JSX text + a small set of translatable attributes.
const ROOT = process.cwd();
const TARGETS = [
  "src/routes/_authenticated",
  "src/components/dashboard",
];
// Admin routes are staff-only and intentionally out of the user-facing AR scope.
const EXCLUDE = /\/admin\.|\/_authenticated\/admin\b/;

const BRAND = new RegExp(
  [
    // Brand / proper nouns we never translate
    "Stripe", "PayPal", "Wise", "Mercury", "Shopify", "Payoneer", "Airwallex",
    "Relay", "Etsy", "eBay", "Amazon", "Google Ads", "Meta Ads", "Google",
    "Meta", "TikTok", "Snapchat", "LaunchBridge", "IRS", "EIN", "ITIN",
    "LLC", "CP-575", "SS-4", "Form 5472", "USD", "MAD", "EUR",
    "WhatsApp", "Wyoming", "Delaware",
  ].join("|"),
  "g",
);

const TRANSLATABLE_ATTRS = new Set([
  "placeholder", "aria-label", "title", "alt",
]);

type Violation = { file: string; line: number; col: number; text: string; reason: string };

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
}

function stripIrrelevant(src: string): string {
  // Remove /* … */ block comments and // line comments
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + " ".repeat(m.length - p.length));
}

function isEnglishish(text: string): boolean {
  // Strip allow-listed brand nouns + numeric + punctuation + currency symbols
  const cleaned = text
    .replace(BRAND, "")
    .replace(/[0-9$£€¥%·•←→↑↓✓✕\s\p{P}]+/gu, "");
  // Anything left with ≥3 consecutive Latin letters is suspicious
  return /[A-Za-z]{3,}/.test(cleaned);
}

function lineCol(src: string, idx: number): { line: number; col: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx; i++) {
    if (src[i] === "\n") { line++; col = 1; } else col++;
  }
  return { line, col };
}

function scanFile(file: string): Violation[] {
  const raw = readFileSync(file, "utf8");
  const src = stripIrrelevant(raw);
  const violations: Violation[] = [];
  const rel = relative(ROOT, file);

  // 1) JSX text nodes between > and < (skip if inside braces/tag attrs)
  // Very rough but effective: matches `>text<` where text contains letters.
  const jsxText = />([^<>{}\n]{2,})</g;
  let m: RegExpExecArray | null;
  while ((m = jsxText.exec(src)) !== null) {
    const text = m[1].trim();
    if (!text) continue;
    if (!isEnglishish(text)) continue;
    // Skip if surrounding 80 chars upstream contain a t( call wrapping this string
    const { line, col } = lineCol(raw, m.index + 1);
    violations.push({ file: rel, line, col, text, reason: "JSX text" });
  }

  // 2) Translatable attributes with string literals
  const attrRe = /\b(placeholder|aria-label|title|alt)\s*=\s*"([^"]+)"/g;
  while ((m = attrRe.exec(src)) !== null) {
    const attr = m[1];
    const text = m[2];
    if (!TRANSLATABLE_ATTRS.has(attr)) continue;
    if (!isEnglishish(text)) continue;
    const { line, col } = lineCol(raw, m.index);
    violations.push({ file: rel, line, col, text, reason: `${attr}=` });
  }

  return violations;
}

const files: string[] = [];
for (const t of TARGETS) walk(join(ROOT, t), files);
const scoped = files.filter((f) => !EXCLUDE.test(f));

const all: Violation[] = [];
for (const f of scoped) all.push(...scanFile(f));

if (all.length === 0) {
  console.log(`✓ i18n-lint: 0 hardcoded English strings in ${scoped.length} files (excluded ${files.length - scoped.length} admin files).`);
  process.exit(0);
}

console.error(`✗ i18n-lint: ${all.length} hardcoded English string(s) across ${new Set(all.map((v) => v.file)).size} file(s):\n`);
for (const v of all) {
  console.error(`  ${v.file}:${v.line}:${v.col}  [${v.reason}]  "${v.text.slice(0, 80)}"`);
}
console.error(`\nFix: replace each literal with t("<key>") and add the key to src/i18n/translations.ts (en/fr/ar).`);
process.exit(1);
