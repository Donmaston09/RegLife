// Content ported from the RegLife prototype. Created by Anthony Onoja, Ph.D., University of Surrey.
// Educational content, not legal advice. Reflects public rules and guidance as of mid-2026.
import type { ChangeType, RoleKey } from './types'

export const ROLES: Record<RoleKey, string> = {RA:'Regulatory affairs',Clin:'Clinical lead',QA:'Quality (QMS)',Legal:'Legal counsel',UX:'Human factors / UX',DPO:'Data protection officer',ML:'ML engineering',CSO:'Clinical safety officer',Mkt:'Marketing',Sec:'Security (CISO)',Proc:'Procurement',Cust:'Customer success'}

export const CHANGES: ChangeType[] = [
 {id:'purpose',g:'Intended use',n:'Add a new indication, disease or clinical claim',lvl:3,
  eu:'Significant change (MDCG 2020-3). Notify the notified body before release.',uk:'Change to intended purpose. Update UKCA conformity and Approved Body review.',us:'New intended use. New 510(k), De Novo or PMA supplement.',ai:'Substantial modification. New conformity assessment.',data:'Check the DPIA still covers the purpose.',who:['RA','Clin','QA','Legal']},
 {id:'users',g:'Intended use',n:'Make a clinician tool available to patients or carers',lvl:3,
  eu:'Significant change. New usability and clinical evidence for lay users.',uk:'Change to intended user. Reassess class and evidence.',us:'Fails FDA CDS criterion 3 (HCP-facing), so the function may become a regulated device.',ai:'Substantial modification. Art 50 disclosure to patients if they interact with the AI.',data:'New controller relationship and privacy notice. Consumer apps may fall under the FTC.',who:['RA','Clin','UX','DPO','Legal']},
 {id:'pop',g:'Intended use',n:'Extend to a new patient population (e.g. children, pregnancy)',lvl:3,
  eu:'Significant change. Needs clinical evidence for the new population.',uk:'Significant change. Update clinical evaluation.',us:'Likely new 510(k). Performance must be shown in the subgroup.',ai:'Substantial modification. Data governance (Art 10) must cover the population.',data:'Children’s data adds Age Appropriate Design Code duties (UK).',who:['RA','Clin','ML','DPO']},
 {id:'claims',g:'Intended use',n:'Move from wellness or admin wording to disease or treatment claims',lvl:3,
  eu:'The product now qualifies as a device. Full MDR conformity before marketing.',uk:'Qualifies as a device. UKCA marking needed.',us:'Leaves General Wellness. Device pathway applies.',ai:'May become high-risk once it needs a notified body.',data:'Data becomes health data in context. Check Art 9 condition.',who:['RA','Mkt','Legal','Clin']},
 {id:'auto',g:'Model and design',n:'Remove the human review step (more autonomy)',lvl:3,
  eu:'Significant change. Class may rise under Rule 11.',uk:'Significant change. Update hazard log (DCB0129).',us:'New submission. Changes the risk profile and CDS status.',ai:'Substantial modification. Human oversight (Art 14) redesign.',data:'GDPR Art 22 solely automated decisions may now apply.',who:['RA','Clin','CSO','UX','Legal']},
 {id:'foundation',g:'Model and design',n:'Swap or upgrade the underlying LLM / foundation model',lvl:3,
  eu:'Usually significant. Change to operating principle. Revalidate.',uk:'Usually significant. Revalidate and update the safety case.',us:'New 510(k) unless pre-specified in a PCCP.',ai:'Likely substantial modification. Get GPAI provider documentation (Art 53).',data:'New sub-processor, transfer and retention terms.',who:['ML','RA','Sec','DPO','Proc']},
 {id:'retrain',g:'Model and design',n:'Retrain the same model on new data, same intended use',lvl:2,
  eu:'Significant if performance or operating principle changes. Document the assessment.',uk:'Assess against MHRA change guidance. Document.',us:'Allowed without a new submission only if inside an authorised PCCP.',ai:'Not substantial if pre-determined in the technical documentation (Art 43(4)).',data:'Lawful basis for using new training data. Update the DPIA.',who:['ML','RA','QA','DPO']},
 {id:'input',g:'Model and design',n:'Add a new input type or sensor (e.g. images, wearable data)',lvl:3,
  eu:'Significant change to design.',uk:'Significant change.',us:'Image or signal analysis fails CDS criterion 1, so it is a device function.',ai:'Substantial modification.',data:'New data categories. Update DPIA and notices.',who:['ML','RA','Clin','DPO']},
 {id:'ui',g:'Model and design',n:'Change how results are displayed (scores, colours, wording)',lvl:2,
  eu:'Significant if it may change clinical interpretation. Usability review (IEC 62366-1).',uk:'Update hazard log. Re-run summative usability if risk changes.',us:'Assess under software change guidance.',ai:'Check transparency and instructions for use (Art 13).',data:'None usually.',who:['UX','Clin','CSO','RA']},
 {id:'patch',g:'Model and design',n:'Bug fix or security patch with no performance change',lvl:1,
  eu:'Non-significant. Record under the QMS change procedure.',uk:'Record under the QMS.',us:'Cybersecurity patches generally need no premarket submission. Document and report under Part 806 if a correction.',ai:'Keep logs and documentation current.',data:'None.',who:['Sec','QA']},
 {id:'market',g:'Deployment',n:'Launch in a new country or market',lvl:3,
  eu:'CE marking needed for EU. Appoint an authorised representative if non-EU.',uk:'UKCA, or CE under GB recognition. UK Responsible Person if non-UK.',us:'FDA establishment registration and pathway.',ai:'EU authorised representative for AI Act if non-EU provider.',data:'International transfer mechanism (SCCs, IDTA, adequacy).',who:['RA','Legal','DPO']},
 {id:'offlabel',g:'Deployment',n:'A hospital customer uses it for a purpose you did not intend',lvl:2,
  eu:'The hospital may become a manufacturer. Art 5(5) in-house exemption is narrow.',uk:'Deployer liability. Record in PMS and act on misuse.',us:'Off-label use by clinicians is allowed, but you must not promote it.',ai:'Under Art 25 a deployer who changes the intended purpose becomes the provider.',data:'Purpose limitation breach risk.',who:['Legal','RA','Cust','Clin']},
 {id:'secondary',g:'Data and infrastructure',n:'Use customer or patient data to train or improve models',lvl:2,
  eu:'No device change by itself. Data feeds the next model version.',uk:'Same. Follow NHS data opt-out and DSPT.',us:'Check BAA permits it. De-identify to HIPAA standard.',ai:'Art 10 data governance and bias examination.',data:'Lawful basis, Art 9 condition, DPIA, transparency. Possible EHDS route.',who:['DPO','Legal','ML','Cust']},
 {id:'cloud',g:'Data and infrastructure',n:'Change cloud host, region or key supplier',lvl:1,
  eu:'Supplier control under ISO 13485. Re-verify if the runtime changes.',uk:'DSPT and DTAC technical security answers change.',us:'Update SBOM and threat model (§524B).',ai:'Cybersecurity and logging (Art 12, 15) must still hold.',data:'New sub-processor notice. Transfer assessment.',who:['Sec','Proc','DPO','QA']}
]
