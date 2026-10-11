// Builds the take-away work documents as Word-compatible HTML, plain text and CSV.
// Created by Anthony Onoja, Ph.D., University of Surrey.
import { csvCell } from './safety'

export interface DocSection { heading: string; fields?: [string, string][]; table?: { head: string[]; rows: string[][] }; list?: string[]; numbered?: boolean; text?: string }
export interface WorkDoc { title: string; subtitle: string; sections: DocSection[] }

const FOOTER = 'Produced with RegLife, an educational tool by Anthony Onoja, Ph.D., University of Surrey. Not legal advice: review with your regulatory, clinical safety and information governance leads before use.'
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

export function toHtml(d: WorkDoc): string {
  const cell = 'border:1px solid #999;padding:6px 8px;vertical-align:top;font-size:10.5pt'
  const body = d.sections.map(s => {
    let h = `<h2 style="font-size:13pt;margin:18px 0 6px">${esc(s.heading)}</h2>`
    if (s.text) h += `<p>${esc(s.text)}</p>`
    if (s.fields) h += `<table style="border-collapse:collapse;width:100%">${s.fields.map(([k, v]) => `<tr><th style="${cell};text-align:left;width:32%;background:#EEF2F1">${esc(k)}</th><td style="${cell}">${esc(v || ' ')}</td></tr>`).join('')}</table>`
    if (s.table) h += `<table style="border-collapse:collapse;width:100%"><tr>${s.table.head.map(c => `<th style="${cell};text-align:left;background:#EEF2F1">${esc(c)}</th>`).join('')}</tr>${s.table.rows.map(r => `<tr>${r.map(c => `<td style="${cell}">${esc(c || ' ')}</td>`).join('')}</tr>`).join('')}</table>`
    if (s.list) h += `<${s.numbered ? 'ol' : 'ul'}>${s.list.map(i => `<li>${esc(i)}</li>`).join('')}</${s.numbered ? 'ol' : 'ul'}>`
    return h
  }).join('')
  return `<html><head><meta charset="utf-8"><title>${esc(d.title)}</title></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt"><h1 style="font-size:18pt;margin:0">${esc(d.title)}</h1><p style="color:#555">${esc(d.subtitle)}</p>${body}<p style="color:#777;font-size:9pt;margin-top:24px">${esc(FOOTER)}</p></body></html>`
}

export function toText(d: WorkDoc): string {
  const out = [d.title, d.subtitle, '']
  for (const s of d.sections) {
    out.push(s.heading.toUpperCase())
    if (s.text) out.push(s.text)
    if (s.fields) for (const [k, v] of s.fields) out.push(`${k}: ${v || '-'}`)
    if (s.table) { out.push(s.table.head.join(' | ')); for (const r of s.table.rows) out.push(r.join(' | ')) }
    if (s.list) s.list.forEach((i, n) => out.push(`${s.numbered ? `${n + 1}.` : '-'} ${i}`))
    out.push('')
  }
  out.push(FOOTER)
  return out.join('\n')
}

export const toCsv = (head: string[], rows: string[][]) => [head, ...rows].map(r => r.map(csvCell).join(',')).join('\n')

export function downloadBlob(name: string, data: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([data], { type }))
  a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'reglife'
