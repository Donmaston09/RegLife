/** Small security helpers. Created by Anthony Onoja, Ph.D., University of Surrey. */

/** Neutralise spreadsheet formulas (CSV injection): a cell starting with = + - @ tab or CR gets a leading apostrophe. */
export function csvCell(v: unknown): string {
  let t = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t
  return `"${t.replace(/"/g, '""')}"`
}

/** Only allow in-app paths after sign-in, never another site ("//evil.example", "https://…", "/\\evil"). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  return next
}
