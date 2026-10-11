// Content for the work documents learners take away. Created by Anthony Onoja, Ph.D., University of Surrey.
import type { ProductKind } from './types'

/* ---------- Vendor questions ---------- */
export interface QuestionTopic { id: string; name: string; why: string; questions: string[]; kinds?: ProductKind[] }

export const VENDOR_TOPICS: QuestionTopic[] = [
  { id: 'status', name: 'Regulatory status', why: 'Confirms the product is lawfully on the market for your use.', questions: [
    'Is the product a medical device? What class, and under which rules (UK MDR, EU MDR)?',
    'Can you share the UKCA or CE certificate, the MHRA registration, and for Northern Ireland the CE or UKNI marking?',
    'What exactly is the intended purpose, including the users, patient population and settings it covers?'] },
  { id: 'evidence', name: 'Evidence and local validation', why: 'Supplier figures may not hold for your population.', questions: [
    'What clinical evidence supports performance, and was any of it independent of the supplier?',
    'Has it been validated on a UK population similar to ours? Can we run it silently on our data before go-live?',
    'Which input devices, systems and data formats is performance validated for?'] },
  { id: 'equity', name: 'Fairness and subgroups', why: 'Average accuracy can hide worse performance for some groups.', questions: [
    'Can you show performance by age, sex, ethnicity and, where relevant, skin tone, language or accent?',
    'What known limitations should our clinicians be told about?'] },
  { id: 'change', name: 'Updates and change control', why: 'Changes after purchase can alter safety and regulatory status.', questions: [
    'How will you tell us about updates, and how much notice will we get?',
    'Who decides whether a change is significant, and will you share that decision and the updated safety case?',
    'Do you change or retrain the model after release? Is that covered by a predetermined change plan?',
    'Can we pin a version or roll back if an update causes problems?'] },
  { id: 'pms', name: 'Monitoring and incidents', why: 'Post-market surveillance is shared between you and the supplier.', questions: [
    'What performance monitoring do you run, and what will you share with us, and how often?',
    'How do we report incidents to you, and how will you tell us about field safety notices?',
    'What thresholds would trigger you to pause or withdraw the product?'] },
  { id: 'safety', name: 'Clinical safety (DCB0129 and DCB0160)', why: 'You need the supplier’s safety case to complete your own.', questions: [
    'Can you share your DCB0129 clinical safety case report and hazard log?',
    'Who is your clinical safety officer, and how will they work with ours?'] },
  { id: 'security', name: 'Cybersecurity', why: 'Supplier breaches have disrupted NHS services.', questions: [
    'What is your Data Security and Protection Toolkit status, and do you hold Cyber Essentials Plus?',
    'Is multi-factor authentication enforced on every account, including customer and support accounts?',
    'How quickly do you patch critical vulnerabilities? Can you provide a software bill of materials?',
    'What is our clinical fallback if your service is down, and how long are your recovery targets?'] },
  { id: 'data', name: 'Data protection and hosting', why: 'Health data is special category data under UK GDPR.', questions: [
    'Where is data stored and processed, including backups and sub-processors? Does any of it leave the UK?',
    'Are you a processor only, or do you use our data for your own purposes, including training models?',
    'How long do you keep inputs, outputs and recordings, and can we have them deleted?',
    'Can you provide information for our DPIA?'] },
  { id: 'genai', name: 'Generative AI controls', why: 'Language models can invent content and be manipulated.', kinds: ['triage', 'chatbot', 'scribe'], questions: [
    'Which underlying model do you use, who supplies it, and how are its version changes controlled?',
    'How do you detect and reduce invented content? What error rate have you measured?',
    'How do you defend against prompt injection, including from uploaded documents?',
    'Do you keep source material (such as audio) long enough for outputs to be checked?'] },
  { id: 'imaging', name: 'Imaging specifics', why: 'Hardware and protocol differences affect image AI.', kinds: ['imaging'], questions: [
    'Which scanner models, protocols and software versions are supported?',
    'How does the tool connect to PACS, and how is that connection secured?'] },
  { id: 'oversight', name: 'Human oversight and training', why: 'Over-reliance is a known hazard.', questions: [
    'What training do users need, and do you provide it?',
    'How does the interface show uncertainty and the reasons for an output?',
    'What should staff do when they disagree with the output?'] },
  { id: 'exit', name: 'Contract and exit', why: 'You need a safe way out.', questions: [
    'What happens to our data and service if the contract ends or you go out of business?',
    'Can we export our data in a usable format?'] }
]

/* ---------- Hazard log (DCB0129 / DCB0160 style) ---------- */
export const SEVERITY = ['Minor', 'Significant', 'Considerable', 'Major', 'Catastrophic'] as const
export const LIKELIHOOD = ['Very low', 'Low', 'Medium', 'High', 'Very high'] as const
/**
 * Risk rating 1 (acceptable) to 5 (unacceptable), indexed [likelihood][severity].
 * Based on the 5x5 matrix commonly used with DCB0129 and DCB0160. Check against your organisation's own matrix.
 */
export const RISK_MATRIX: number[][] = [
  [1, 1, 2, 2, 3],
  [1, 2, 2, 3, 4],
  [2, 2, 3, 3, 4],
  [2, 3, 3, 4, 5],
  [3, 4, 4, 5, 5]
]
export const RATING_LABEL = ['', 'Acceptable', 'Acceptable where cost of further reduction outweighs benefit', 'Undesirable: needs controls and sign-off', 'Unacceptable unless further controls', 'Unacceptable']

export interface HazardPreset { id: string; title: string; cause: string; effect: string; harm: string; controls: string; extra: string; kinds?: ProductKind[] }
export const HAZARDS: HazardPreset[] = [
  { id: 'invented', title: 'AI output contains invented clinical content', cause: 'Generative model produces content not supported by the source (hallucination)', effect: 'Incorrect information in the record or advice', harm: 'Wrong treatment or missed diagnosis', controls: 'Clinician reviews output before use', extra: 'Highlight unsupported statements; sample outputs for errors; keep source long enough to check', kinds: ['scribe', 'chatbot', 'triage'] },
  { id: 'missed', title: 'Deterioration or urgent condition not flagged', cause: 'Model sensitivity lower in our population or after data drift', effect: 'Delayed escalation', harm: 'Avoidable deterioration or death', controls: 'Existing clinical observation and escalation policy', extra: 'Local silent-mode validation; monitor missed cases monthly; agreed performance threshold with supplier', kinds: ['triage', 'prediction', 'imaging'] },
  { id: 'bias', title: 'Lower performance for some patient groups', cause: 'Training data under-represents some groups', effect: 'Late or wrong outputs for those groups', harm: 'Unequal care and avoidable harm', controls: 'None specific', extra: 'Obtain subgroup performance; brief clinicians on limitations; monitor outcomes by group' },
  { id: 'overreliance', title: 'Staff rely on the AI without checking', cause: 'Automation bias, workload pressure', effect: 'Errors pass unchallenged', harm: 'Wrong treatment or missed diagnosis', controls: 'Training at go-live', extra: 'Show reasons and uncertainty; audit agreement rates; refresher training' },
  { id: 'offlabel', title: 'Used outside its intended purpose', cause: 'Staff extend use to new patient groups or settings', effect: 'Outputs not validated for those patients', harm: 'Wrong or delayed care', controls: 'Intended purpose in local policy', extra: 'Technical restrictions where possible; audit use; incident reporting' },
  { id: 'injection', title: 'Instructions hidden in inputs change AI behaviour', cause: 'Prompt injection through uploaded documents or free text', effect: 'Unsafe or misleading advice', harm: 'Patient follows wrong advice', controls: 'Supplier input filtering', extra: 'Ask for red-team results; restrict uploads; monitor flagged outputs', kinds: ['chatbot', 'triage', 'scribe'] },
  { id: 'outage', title: 'Service unavailable', cause: 'Cyber attack, supplier failure or network outage', effect: 'Workflow stops', harm: 'Delayed care', controls: 'Supplier service levels', extra: 'Tested paper or manual fallback; downtime procedure; supplier security assurance' },
  { id: 'crisis', title: 'Crisis or self-harm risk not escalated', cause: 'Chatbot fails to detect or respond to risk', effect: 'User in crisis gets no help', harm: 'Self-harm or suicide', controls: 'Signposting text', extra: 'Tested crisis detection; fixed safe responses; human escalation route', kinds: ['chatbot'] },
  { id: 'update', title: 'Supplier update changes behaviour', cause: 'Model or software change without local assessment', effect: 'Unexpected outputs after update', harm: 'Wrong or delayed care', controls: 'Supplier release notes', extra: 'Contractual notice period; local regression tests before go-live; version pinning' }
]
