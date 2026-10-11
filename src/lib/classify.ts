import type { Answers } from '../content/types'

export type Level = 'hi' | 'mid' | 'lo'
export interface Verdict { j: string; v: string; l: Level }

/** Indicative regulatory status from the boundary questions. Educational only. */
export function classify(a: Answers): { out: Verdict[]; notes: string[]; isDevice: boolean } {
  const out: Verdict[] = []
  const isDevice = !a.wellness && a.medical && a.analyse && a.individual

  if (!isDevice) {
    out.push({ j: 'EU MDR', l: 'lo', v: a.wellness && !a.medical ? 'Probably not a medical device (wellness or admin).' : 'Probably not a device on these answers, but check MDCG 2019-11 carefully.' })
  } else {
    const cls = a.critical ? 'Class IIb, or III if it could cause death or irreversible harm'
      : a.signal ? 'Class IIa or higher (monitoring physiological parameters)'
      : 'Class IIa (Rule 11 default for decision-informing software)'
    out.push({ j: 'EU MDR', l: 'hi', v: `Likely a medical device under MDR. ${cls}. Needs a notified body.` })
  }

  if (isDevice) out.push({ j: 'EU AI Act', l: 'hi', v: 'High-risk AI system (Art 6(1)): it is a device that needs notified-body assessment. Full Chapter III duties.' })
  else if (a.genai) out.push({ j: 'EU AI Act', l: 'mid', v: 'Not high-risk on these answers. Art 50 transparency applies: tell users they are talking to AI. Art 4 AI literacy applies to staff.' })
  else out.push({ j: 'EU AI Act', l: 'lo', v: 'Probably minimal risk. Art 4 AI literacy still applies.' })

  out.push(isDevice
    ? { j: 'UK MHRA', l: 'hi', v: 'Likely a medical device under UK MDR 2002. Many SaMD are Class I under current GB rules, but MHRA reform is aligning to Rule 11, so plan for IIa or higher. DCB0129 applies for NHS use.' }
    : { j: 'UK MHRA', l: 'lo', v: 'Probably not a device. If sold to the NHS, DTAC and DCB0129 still apply.' })

  const cds = !a.signal && !a.patient && a.review
  if (!a.medical || a.wellness) out.push({ j: 'US FDA (comparison)', l: 'lo', v: 'Likely outside FDA device oversight (general wellness or admin). FTC rules still apply to consumer health apps.' })
  else if (cds) out.push({ j: 'US FDA (comparison)', l: 'mid', v: 'May qualify as non-device CDS under §520(o)(1)(E): HCP-facing, no signal analysis, basis reviewable. Document all four criteria.' })
  else {
    const why: string[] = []
    if (a.signal) why.push('it analyses images or signals')
    if (a.patient) why.push('patients use it directly')
    if (!a.review) why.push('clinicians cannot independently review the basis')
    out.push({ j: 'US FDA (comparison)', l: 'hi', v: `Likely a device software function because ${why.join(', ')}. Expect 510(k) or De Novo. Consider a PCCP for model updates.` })
  }

  const dp = ['UK GDPR: health data is special category data. Complete a DPIA and record your Article 9 condition.']
  if (a.nhs) dp.push('NHS deployment: the deploying organisation needs its own DPIA and Caldicott Guardian sign-off, and you need the Data Security and Protection Toolkit.')
  out.push({ j: 'Data protection', l: 'mid', v: dp.join(' ') })
  if (a.nhs) out.push({ j: 'NHS assurance', l: isDevice ? 'hi' : 'mid', v: `Expect DTAC, clinical safety under DCB0129 (you) and DCB0160 (each deploying organisation in England), and equivalent assurance in Scotland, Wales and Northern Ireland.${isDevice ? ' In Northern Ireland the device also needs CE or UKNI marking.' : ''}` })

  const notes: string[] = []
  if (a.genai) notes.push('Generative AI: plan controls for hallucination, prompt injection and vendor model changes. Regulators expect evidence, not disclaimers.')
  if (a.patient && isDevice) notes.push('Lay users: usability evidence (IEC 62366-1) carries more weight.')
  if (a.critical) notes.push('Critical use: stronger clinical evidence and human oversight design.')
  return { out, notes, isDevice }
}
