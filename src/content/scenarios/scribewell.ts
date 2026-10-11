// Ambient scribe scenario. Created by Anthony Onoja, Ph.D., University of Surrey.
// Fictional product. Educational content, not legal advice.
import type { Scenario } from '../types'

export const SCRIBEWELL: Scenario = {
  id: 'scribewell',
  title: 'Ambient voice scribe',
  product: 'ScribeWell',
  blurb: 'An AI that listens to consultations and drafts the clinical note. Learn when transcription becomes a medical device and how to manage consent, accuracy and data.',
  tags: ['GenAI', 'Speech', 'Clinician-facing'],
  doc: 'vendor', kind: 'scribe', perspective: 'manufacturer',
  events: [
    {
      b: 'mhra', q: 'Q1 · Device or not',
      t: 'ScribeWell transcribes the consultation and then summarises it into a structured note with a suggested plan.',
      o: [
        { l: 'It is only documentation, so it is not a device.', d: { comp: -20 }, r: 'Pure transcription is usually not a device. Summarising, structuring and suggesting a plan goes further.', les: 'NHS England’s 2025 guidance on ambient voice technology indicates that tools which generate summaries beyond transcription are likely to be medical devices (at least Class I in GB).' },
        { l: 'Register as a medical device, set up a QMS and clinical safety case.', d: { comp: 20, cash: -10, speed: -5 }, r: 'You register with the MHRA and complete DTAC and DCB0129.', les: 'Generative summarisation of clinical encounters is treated as more than admin software. Check the guidance in each market.' }
      ]
    },
    {
      b: 'model', q: 'Q2 · Invented detail',
      t: 'A GP notices the note says "patient takes warfarin". The patient never mentioned it.',
      o: [
        { l: 'Remind clinicians to check notes.', d: { safety: -10, comp: -5 }, r: 'Busy clinicians sign notes quickly. The error rate stays the same.', les: 'Hallucination in clinical notes is a patient safety hazard. Relying on review alone is weak when review is rushed.' },
        { l: 'Highlight content not grounded in the transcript, link each statement to its source, and track an error rate.', d: { safety: 20, comp: 10, cash: -10 }, r: 'Unsupported statements are flagged in amber. The measured error rate falls by two-thirds.', les: 'Grounding, source linking and measured accuracy are design controls you can evidence.' }
      ]
    },
    {
      b: 'clinic', q: 'Q3 · Consent',
      t: 'Patients are not always told the consultation is being recorded and processed by AI.',
      o: [
        { l: 'Put it in the practice privacy notice only.', d: { trust: -15, comp: -15 }, r: 'A patient complains after seeing an AI note. In some US states, recording without all-party consent is unlawful.', les: 'Transparency to patients is a data protection duty. US state wiretap laws may require consent from everyone recorded.' },
        { l: 'Give clinicians a script, a visible indicator and an easy opt-out each time.', d: { trust: 15, comp: 15, speed: -5 }, r: 'Opt-out rates are under 3% and complaints stop.', les: 'Clear, in-the-moment information and a real choice maintain trust.' }
      ]
    },
    {
      b: 'dpa', q: 'Q4 · Training data',
      t: 'Your ML team wants to keep the audio recordings to train the next model.',
      o: [
        { l: 'Keep everything. Storage is cheap.', d: { comp: -25, trust: -15 }, r: 'Customers’ data protection officers say their contracts and privacy notices do not allow this.', les: 'Secondary use of health data for training needs a lawful basis, an Art 9 condition, contractual permission and a DPIA.' },
        { l: 'Delete audio after note sign-off by default; use only consented, de-identified data for training.', d: { comp: 20, trust: 10, speed: -10 }, r: 'Training data grows slowly but cleanly. Procurement teams like the deletion default.', les: 'Data minimisation and storage limitation are design choices. Make deletion the default.' }
      ]
    },
    {
      b: 'lab', q: 'Q5 · Coding and orders',
      t: 'Product wants to add automatic diagnosis codes and suggested prescriptions to the note.',
      o: [
        { l: 'Add them in the next sprint.', d: { comp: -25, safety: -10, speed: 10 }, r: 'Suggesting diagnoses and prescriptions changes the intended purpose and likely the risk class.', les: 'Adding decision-support features to a scribe is a significant change. It may move you to a higher class and, in the US, into device CDS territory.' },
        { l: 'Run a change impact assessment and plan a separate regulated feature.', d: { comp: 15, speed: -10 }, r: 'You split the roadmap. The scribe stays as it is while the coding feature gets its own evidence and assessment.', les: 'Change control protects your existing approval while you build new claims.' }
      ]
    },
    {
      b: 'model', q: 'Q6 · Accents',
      t: 'Word error rates are twice as high for patients with strong regional accents and for those speaking through interpreters.',
      o: [
        { l: 'Average accuracy is fine. Ship.', d: { safety: -15, trust: -15 }, r: 'Notes for some patients are less accurate, so their care records are worse.', les: 'Speech recognition bias is a health equity issue. Test by accent, language and interpreter use.' },
        { l: 'Measure by accent and language group, improve the model, and flag low-confidence transcripts.', d: { safety: 10, trust: 15, cash: -10 }, r: 'Flags prompt closer review where accuracy is likely to be lower.', les: 'Subgroup testing and confidence flags are fairness controls you can show regulators.' }
      ]
    },
    {
      b: 'soc', q: 'Q7 · Audio breach',
      t: 'A misconfigured storage bucket exposes 4,000 consultation recordings for 36 hours.',
      o: [
        { l: 'Fix it quietly. No evidence anyone downloaded them.', d: { comp: -25, trust: -20 }, r: 'Access logs later show downloads. You missed the 72-hour notification window.', les: 'Under UK and EU GDPR, assess and notify within 72 hours of becoming aware unless the breach is unlikely to cause risk. Health audio is high risk.' },
        { l: 'Contain, check access logs, notify the regulator and customers, and tell affected patients where needed.', d: { comp: 10, trust: 5, cash: -10 }, r: 'Regulators note your prompt response. You add configuration scanning to the release pipeline.', les: 'Have a breach plan that covers controller customers, regulators and patients, with clear roles.' }
      ]
    },
    {
      b: 'hospital', q: 'Q8 · Deskilling',
      t: 'Trainee doctors stop writing their own notes and struggle when ScribeWell is down.',
      o: [
        { l: 'Not our problem. It works most of the time.', d: { safety: -10, trust: -10 }, r: 'An outage in a busy clinic leads to incomplete notes and a near miss.', les: 'Foreseeable dependency and downtime are hazards. Deployers need fallback procedures.' },
        { l: 'Publish a downtime procedure, give training guidance for educators, and track uptime.', d: { safety: 10, trust: 10 }, r: 'Trusts add AI-free documentation practice to training rotations.', les: 'Human oversight includes keeping the skills needed to work without the tool (AI Act Art 4 and 14).' }
      ]
    }
  ]
}
