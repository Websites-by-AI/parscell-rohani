/**
 * Shared clean formatting for bot replies (Telegram + Bale + Immigration).
 * Style rules: short one-line entries, clipped text, minimal emoji, no walls
 * of indented text. Every string is HTML-escaped for parse_mode=HTML.
 */

import type { MigrationAgent } from "@/data/immigration";

export function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function b(s: string): string {
  return `<b>${esc(s)}</b>`;
}

export function c(s: string): string {
  return `<code>${esc(s)}</code>`;
}

export function clip(s: string, n: number): string {
  const t = String(s ?? "");
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/** "• <b>name</b> — detail" single-line entry. */
export function li(name: string, detail: string): string {
  return `• ${b(clip(name, 30))} — ${esc(clip(detail, 60))}`;
}

/** One clean line per migration agent. */
export function agentLine(a: MigrationAgent, index?: number): string {
  const icon = a.kind === "company" ? "🏢" : a.kind === "human" ? "👤" : "🤖";
  const num = index !== undefined ? `${index}. ` : "";
  const bits: string[] = [`${icon} ${num}${b(clip(a.name, 26))}`, esc(clip(a.country, 20))];
  if (a.credentials) bits.push(esc(a.credentials));
  if (a.phone) bits.push(`📞 ${c(a.phone)}`);
  return bits.join(" · ");
}

/** Section header — short, centered clarity. */
export function h(s: string): string {
  return `${esc(s)}`;
}
