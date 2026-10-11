// Content ported from the RegLife prototype. Created by Anthony Onoja, Ph.D., University of Surrey.
// Educational content, not legal advice. Reflects public rules and guidance as of mid-2026.
export const CLOCKS = [
 {t:'24 h',n:'NIS2 early warning',d:'Significant cyber incident at an in-scope entity (then 72 h notification, 1 month final report).',j:'EU'},
 {t:'2 days',n:'Serious public health threat',d:'EU MDR Art 87 and UK PMS rules. Also AI Act Art 73 for widespread incidents.',j:'EU / UK'},
 {t:'72 h',n:'Personal data breach to regulator',d:'GDPR / UK GDPR Art 33, unless unlikely to cause risk.',j:'EU / UK'},
 {t:'5 days',n:'FDA 5-day report',d:'21 CFR 803 when remedial action is needed to prevent unreasonable risk of substantial harm (work days).',j:'US'},
 {t:'10 days',n:'Death or unanticipated serious deterioration',d:'EU MDR / UK PMS / AI Act Art 73.',j:'EU / UK'},
 {t:'15 days',n:'Other serious incidents',d:'EU MDR Art 87, UK PMS, AI Act Art 73. For MDR devices, AI Act reporting covers only fundamental-rights breaches; the rest goes through MDR vigilance.',j:'EU / UK'},
 {t:'30 days',n:'FDA Medical Device Report',d:'Manufacturer MDR for death, serious injury or malfunction likely to cause one.',j:'US'},
 {t:'60 days',n:'HIPAA and FTC breach notices',d:'Notify individuals without unreasonable delay and within 60 days; HHS within 60 days if 500 or more people.',j:'US'}
]

export const CADENCE: [string, string, string][] = [
 ['Continuous','Uptime, latency, security alerts, injection blocks, PII in outputs','Engineering, Security'],
 ['Weekly','Hallucination sample review, complaints triage, override rates','Clinical lead, CSO'],
 ['Monthly','Accuracy by site and subgroup, drift metrics, vendor model versions','ML, Quality'],
 ['Quarterly','Trend analysis, hazard log review, change log review, AI governance board','RA, QA, Clinical, DPO'],
 ['Yearly','PSUR (Class IIb/III; every 2 years for IIa), DPIA review, pen test, clinical evaluation update','RA, DPO, Security']
]
