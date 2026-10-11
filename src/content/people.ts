// Content ported from the RegLife prototype. Created by Anthony Onoja, Ph.D., University of Surrey.
// Educational content, not legal advice. Reflects public rules and guidance as of mid-2026.
export const RACI_COLS = ['RA','Clin','CSO','QA','ML','Sec','DPO','Legal','Deployer'] as const

export const RACI_HEAD: Record<string, string> = {RA:'Reg',Clin:'Clin',CSO:'CSO',QA:'QA',ML:'ML',Sec:'Sec',DPO:'DPO',Legal:'Legal',Deployer:'Site'}

export const RACI: string[][] = [
 ['Write the intended purpose','A','R','C','C','C','I','C','C','I'],
 ['Qualify and classify','A','C','I','C','I','I','I','R','I'],
 ['Change impact assessment','A','C','C','R','R','C','C','C','I'],
 ['Clinical evaluation and validation','C','A','C','I','R','I','I','I','C'],
 ['Hazard log and safety case','C','C','A','R','C','C','I','I','R'],
 ['Bias and subgroup testing','C','A','C','I','R','I','C','C','I'],
 ['Threat model, pen test, SBOM','I','I','C','C','C','A','I','I','I'],
 ['DPIA and lawful basis','I','C','I','I','C','C','A','R','C'],
 ['Post-market monitoring','A','R','R','R','R','C','I','I','C'],
 ['Incident reporting to regulators','A','C','R','R','C','R','R','C','C'],
 ['User training and oversight','I','C','R','I','I','I','I','I','A']
]

export const PEOPLE: [string, string][] = [
 ['Regulatory affairs','Owns qualification, classification, submissions and the regulatory strategy. Talks to notified bodies, MHRA and FDA.'],
 ['Clinical lead','Defines clinical claims, evidence and acceptable performance. Signs off clinical risk.'],
 ['Clinical safety officer','Registered clinician who owns the DCB0129 hazard log and safety case. The deploying trust needs its own for DCB0160.'],
 ['Quality (QMS)','Runs change control, CAPA, document control and audits under ISO 13485.'],
 ['ML engineering','Builds, validates and monitors models. Produces data lineage and model cards.'],
 ['Security (CISO)','Threat models, SBOM, vulnerability management, incident response.'],
 ['Data protection officer','DPIAs, lawful basis, data subject rights, breach notification.'],
 ['Legal counsel','Contracts (BAA, DPA, supplier terms), liability, marketing claims, sanctions.'],
 ['Deploying organisation','Hospital or clinic using the tool. Has its own duties: AI Act deployer obligations, DCB0160, CQC, staff training.'],
 ['Patients and the public','Patient and public involvement shapes acceptable use, consent and transparency.']
]
