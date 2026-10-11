// Content ported from the RegLife prototype. Created by Anthony Onoja, Ph.D., University of Surrey.
// Educational content, not legal advice. Reflects public rules and guidance as of mid-2026.
import type { Answers } from './types'

export const QUESTIONS: { id: keyof Answers; p: string; h: string }[] = [
 {id:'wellness',p:'Is it only for general wellness, fitness or admin tasks, with no disease-related claims?',h:'Examples: step counts, appointment booking, billing.'},
 {id:'medical',p:'Does its intended purpose or marketing say it diagnoses, predicts, monitors, prevents or treats a disease or condition?',h:'Regulators read your website, app store listing and sales decks, not only your label.'},
 {id:'analyse',p:'Does it analyse or interpret data, beyond storing, sending or simple search?',h:'Summarising, scoring, flagging and recommending all count as analysis.'},
 {id:'individual',p:'Is the output about an individual patient?',h:''},
 {id:'signal',p:'Does it analyse medical images, ECG or other physiological signals, or lab/IVD data?',h:'This alone makes it a device function under the FDA CDS test.'},
 {id:'patient',p:'Do patients or carers use it directly?',h:''},
 {id:'review',p:'Can a clinician see and independently check the basis for each recommendation?',h:'FDA CDS criterion 4.'},
 {id:'critical',p:'Could a wrong output contribute to death or irreversible harm (critical or serious situations)?',h:'Rule 11 escalates to Class IIb or III.'},
 {id:'genai',p:'Does it use a large language model or other generative AI?',h:''},
 {id:'nhs',p:'Will an NHS organisation deploy it, in any of the four UK nations?',h:'Brings in DTAC, the DCB0129 and DCB0160 clinical safety standards (England), the Data Security and Protection Toolkit, and each nation\u2019s own assurance.'}
]

export const DEFAULT_ANSWERS: Answers = {wellness:false,medical:true,analyse:true,individual:true,signal:false,patient:true,review:false,critical:false,genai:true,nhs:true}
