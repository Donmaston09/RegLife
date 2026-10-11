// Review records for every piece of content. Created by Anthony Onoja, Ph.D., University of Surrey.
// Every item starts as "awaiting expert review". When a panel member checks an item, add an entry to
// REVIEWS with their name, the date and status 'expert'. The monthly content check flags anything older
// than REVIEW_INTERVAL_DAYS.

export type ContentKind = 'framework' | 'drill' | 'scenario' | 'regulator' | 'change' | 'risk' | 'update'
export interface Review { lastReviewed: string; reviewer: string; status: 'awaiting' | 'expert' }

export const REVIEW_INTERVAL_DAYS = 180

/** Applies to any item without its own entry below. */
export const REVIEW_DEFAULT: Review = { lastReviewed: '2026-10-11', reviewer: 'Anthony Onoja (author)', status: 'awaiting' }

/**
 * Per-item overrides, keyed "kind:id" (frameworks use their name as id).
 * Example once the panel has checked an item:
 *   'drill:fsn': { lastReviewed: '2027-01-15', reviewer: 'A. Expert, clinical safety officer', status: 'expert' },
 */
export const REVIEWS: Record<string, Partial<Review>> = {}

export const reviewKey = (kind: ContentKind, id: string) => `${kind}:${id}`
export const reviewOf = (kind: ContentKind, id: string): Review => ({ ...REVIEW_DEFAULT, ...REVIEWS[reviewKey(kind, id)] })

export function ageDays(r: Review, today = new Date()): number {
  return Math.floor((today.getTime() - Date.parse(r.lastReviewed)) / 864e5)
}
export const isDue = (r: Review, today = new Date()) => ageDays(r, today) > REVIEW_INTERVAL_DAYS

export const fmtDate = (iso: string) => new Date(iso + (iso.length === 10 ? 'T12:00:00Z' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
