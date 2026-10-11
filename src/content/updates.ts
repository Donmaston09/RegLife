// Regulatory updates log: dated changes and coming deadlines shown in the app and the news ticker.
// Created by Anthony Onoja, Ph.D., University of Surrey.
// Add new items at the top. Each needs a primary source and must be checked before it is published.
// `affects` lists building ids so learners can jump to the part of the city that changed.

export interface RegUpdate {
  id: string
  date: string // ISO date; a future date is shown as "coming up"
  kind: 'law' | 'guidance' | 'enforcement' | 'deadline' | 'app'
  jurisdiction: 'UK' | 'EU' | 'US' | 'Intl' | 'App'
  title: string
  summary: string
  source?: string
  affects: string[]
  ticker?: string // short line for the news ticker
}

export const UPDATES: RegUpdate[] = [
  {
    id: 'app-review-dates', date: '2026-10-11', kind: 'app', jurisdiction: 'App',
    title: 'Review dates added to all content',
    summary: 'Every framework, drill, scenario and regulator profile now shows when it was last checked and by whom. All items are awaiting review by the expert panel.',
    affects: ['library'], ticker: 'New: every item now shows when it was last checked'
  },
  {
    id: 'eu-pld-2026', date: '2026-12-09', kind: 'deadline', jurisdiction: 'EU',
    title: 'New EU Product Liability Directive applies',
    summary: 'Member states must apply the new directive, which treats software and AI as products and can treat missing security updates as a defect.',
    source: 'https://eur-lex.europa.eu/eli/dir/2024/2853/oj', affects: ['court'], ticker: 'EU Product Liability Directive applies from 9 Dec 2026'
  },
  {
    id: 'ai-act-general', date: '2026-08-02', kind: 'law', jurisdiction: 'EU',
    title: 'EU AI Act: general date of application',
    summary: 'Most remaining AI Act provisions were due to apply from this date under the original timetable. The 2025 Digital Omnibus proposal sought to delay some high-risk obligations; check the current position.',
    source: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', affects: ['aio'], ticker: 'AI Act general application date: 2 Aug 2026 (check Omnibus changes)'
  },
  {
    id: 'ai-act-annex1', date: '2027-08-02', kind: 'deadline', jurisdiction: 'EU',
    title: 'EU AI Act: high-risk duties for AI in medical devices',
    summary: 'Under the original timetable, AI that is a medical device needing notified-body assessment must meet high-risk requirements from this date. A delay has been proposed.',
    source: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', affects: ['aio', 'nb'], ticker: 'AI Act duties for device AI due Aug 2027 (delay proposed)'
  },
  {
    id: 'uk-pms-2025', date: '2025-06-16', kind: 'law', jurisdiction: 'UK',
    title: 'UK post-market surveillance rules in force',
    summary: 'Strengthened post-market surveillance requirements for medical devices in Great Britain, including shorter serious incident reporting timelines.',
    source: 'https://www.gov.uk/government/collections/software-and-artificial-intelligence-ai-as-a-medical-device', affects: ['mhra', 'tower'], ticker: 'UK post-market surveillance rules in force since June 2025'
  },
  {
    id: 'ico-advanced-2025', date: '2025-03-27', kind: 'enforcement', jurisdiction: 'UK',
    title: 'ICO fines NHS software supplier £3.07 million',
    summary: 'The fine followed a 2022 ransomware attack that disrupted NHS 111. The ICO cited incomplete multi-factor authentication, patching and vulnerability scanning.',
    source: 'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/03/software-provider-fined-3m-following-2022-ransomware-attack/', affects: ['ico', 'soc'], ticker: 'ICO fined an NHS software supplier £3.07m after ransomware'
  },
  {
    id: 'equity-review-2024', date: '2024-03-11', kind: 'guidance', jurisdiction: 'UK',
    title: 'Independent Review of Equity in Medical Devices',
    summary: 'Found pulse oximeters can overestimate oxygen levels in people with darker skin and warned of similar risks in AI. The government accepted its recommendations.',
    source: 'https://pharmaceutical-journal.com/article/news/uk-government-backs-all-recommendations-made-following-review-of-bias-in-medical-devices', affects: ['model']
  }
]

const byDate = (a: RegUpdate, b: RegUpdate) => b.date.localeCompare(a.date)
export const recentUpdates = (today = new Date()) => UPDATES.filter(u => Date.parse(u.date) <= today.getTime()).sort(byDate)
export const comingUp = (today = new Date()) => UPDATES.filter(u => Date.parse(u.date) > today.getTime()).sort((a, b) => a.date.localeCompare(b.date))
/** Ticker: next two deadlines, then the most recent changes. */
export const tickerLines = (today = new Date()) => [...comingUp(today).slice(0, 2), ...recentUpdates(today).slice(0, 4)].filter(u => u.ticker).map(u => u.ticker!)
