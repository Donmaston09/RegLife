// Original TriageMate scenario. Created by Anthony Onoja, Ph.D., University of Surrey.
import type { Scenario } from '../types'

export const TRIAGEMATE: Scenario = {
  id: 'triagemate',
  title: 'Symptom triage assistant',
  product: 'TriageMate',
  blurb: 'A generative AI assistant that tells adult patients how urgently to seek care. Run it for 12 quarters across the UK, EU and US.',
  tags: ['GenAI', 'Triage', 'Patient-facing'],
  doc: 'change', kind: 'triage', perspective: 'manufacturer',
  events: [
 {b:'hq',q:'Q1 · Launch',t:'Marketing wants the homepage to say "TriageMate spots sepsis before your doctor does". Right now you are registered as a wellness app.',o:[
  {l:'Publish it. Growth matters.',d:{cash:10,comp:-30,trust:-5},r:'A competitor reports you to the MHRA. A disease claim on a wellness product means you are selling an unapproved medical device.',les:'Claims define intended purpose. Marketing copy can change your regulatory status overnight.'},
  {l:'Keep wellness wording and remove the sepsis line.',d:{comp:5,cash:-2},r:'Safe for now, but your sales team keeps overselling in demos.',les:'Wellness status depends on every claim you make, including what sales staff say.'},
  {l:'Start a medical device pathway for the triage function.',d:{cash:-15,comp:20,trust:10,speed:-10},r:'You appoint a regulatory lead and begin a technical file. It is slow but investors like it.',les:'Deciding early lets you design the QMS, evidence and change control into the product.'}]},
 {b:'model',q:'Q2 · Supplier',t:'Your LLM vendor emails: "The model behind the latest alias upgrades next Tuesday."',o:[
  {l:'Let it upgrade automatically.',d:{safety:-15,comp:-15,speed:5},r:'Refusals double and two urgent cases get routine advice. Nobody can say which model produced them.',les:'An unmanaged foundation model change is an uncontrolled design change (IEC 62304 SOUP, MDCG 2020-3).'},
  {l:'Pin the current version and run the regression suite on the new one first.',d:{safety:10,comp:10,speed:-5},r:'The new version fails 4 red-team cases. You stay pinned and raise it with the vendor.',les:'Pin versions, contract for change notice, and test before you move.'},
  {l:'Switch vendors entirely to avoid the hassle.',d:{cash:-10,speed:-15,comp:-5},r:'A new model means a new validation and probably a significant change. The hassle grows.',les:'Swapping the foundation model is usually a significant change.'}]},
 {b:'soc',q:'Q3 · Security',t:'A tester shows that a PDF referral letter with hidden text makes TriageMate tell a chest-pain patient to "rest at home".',o:[
  {l:'Hotfix the prompt quietly. No need to tell anyone.',d:{safety:-5,comp:-20,trust:-10},r:'Three months later a customer finds the same flaw in a variant. Your logs show you knew.',les:'Assess every safety-relevant flaw for vigilance reporting and record it in CAPA.'},
  {l:'Treat it as a potential incident: contain, assess reportability, fix, and add tests.',d:{safety:15,comp:15,trust:10,speed:-5},r:'No patient harm found, so it is not reportable, but the CAPA and test suite impress your notified body.',les:'Prompt injection is a cybersecurity and robustness risk (AI Act Art 15, FDA §524B).'},
  {l:'Disable document upload until you understand it.',d:{safety:10,cash:-5,trust:-5},r:'Safe, but customers complain. You still need a proper fix.',les:'Containment buys time but does not replace root cause analysis.'}]},
 {b:'model',q:'Q4 · Accuracy',t:'A GP forwards a screenshot: TriageMate cited "NICE NG999", which does not exist.',o:[
  {l:'Add a disclaimer: "AI may make mistakes."',d:{comp:-5,safety:-5,trust:-5},r:'The disclaimer does not stop the next fake citation. Regulators do not accept warnings in place of design controls.',les:'Under ISO 14971, information for safety is the last resort after inherent safety by design.'},
  {l:'Ground answers in a curated, versioned guideline library and verify citations before display.',d:{safety:15,comp:10,cash:-10},r:'Fake citations drop to zero on your test set. Answers without a source are now flagged.',les:'Retrieval grounding plus automatic verification is a design control you can evidence.'},
  {l:'Hide citations so it cannot get them wrong.',d:{trust:-15,comp:-10},r:'Clinicians can no longer check the basis. You also fail the FDA CDS criterion 4 logic.',les:'Removing transparency to hide errors makes the black-box problem worse.'}]},
 {b:'model',q:'Q5 · Fairness',t:'Your new skin-photo feature has lower sensitivity on darker skin tones (Fitzpatrick V-VI).',o:[
  {l:'Ship it. Average accuracy is good.',d:{safety:-20,trust:-20,comp:-15,cash:5},r:'A journalist publishes the gap. A trust pauses its contract.',les:'AI Act Art 10 requires bias examination. Averages hide subgroup harm.'},
  {l:'Delay, collect representative data, and publish subgroup results.',d:{safety:10,trust:15,comp:10,speed:-10,cash:-10},r:'The gap narrows to 3 points. You state the remaining limitation in the instructions for use.',les:'Report performance by subgroup and label limits you cannot yet close.'},
  {l:'Launch but exclude Fitzpatrick V-VI in the intended use.',d:{trust:-10,comp:5},r:'Legally clearer, but you have built a product that excludes some patients.',les:'Narrowing intended use is valid but has equity and commercial costs.'}]},
 {b:'hospital',q:'Q6 · Off-label',t:'A children’s hospital wants to use TriageMate for under-16s. Your intended use is adults.',o:[
  {l:'Say yes. It is their clinical decision.',d:{cash:10,comp:-20,safety:-10},r:'Your sales team helped configure it, which looks like promotion of an unapproved use.',les:'Supporting off-label use can make you responsible. Under AI Act Art 25 the hospital may also become a provider.'},
  {l:'Decline for now and plan a paediatric study.',d:{comp:10,safety:10,cash:-5},r:'The hospital joins your clinical investigation as a site.',les:'A new population is a significant change. Evidence first.'}]},
 {b:'ico',q:'Q7 · Data',t:'Data science wants to retrain monthly on customer chat logs.',o:[
  {l:'Start next month. The data is ours.',d:{comp:-20,trust:-10,speed:10},r:'Your NHS customer’s DPO says the contract does not allow this. The BAA with a US clinic forbids it too.',les:'Secondary use needs a lawful basis, contract permission and a DPIA.'},
  {l:'Write a PCCP / predetermined change plan and update the DPIA and contracts first.',d:{comp:20,speed:-10,cash:-5},r:'Your notified body accepts the pre-determined change protocol. Monthly retrains no longer need fresh approval.',les:'FDA PCCPs and AI Act Art 43(4) let planned changes proceed without new assessment.'}]},
 {b:'soc',q:'Q8 · Cyber',t:'Ransomware hits your hosting supplier. Triage is offline and some chat logs may have been copied.',o:[
  {l:'Wait for the supplier’s update before saying anything.',d:{comp:-25,trust:-20},r:'You miss the 72-hour GDPR deadline and the NIS2 early warning window.',les:'Breach clocks start when you become aware, not when the supplier confirms.'},
  {l:'Run your incident plan: clinical fallback, notify regulators within deadlines, tell customers.',d:{comp:15,trust:10,cash:-10,safety:10},r:'Sites switch to the manual triage protocol. The ICO notes your prompt notice.',les:'An incident plan must include a clinical fallback, not just IT recovery.'}]},
 {b:'hospital',q:'Q9 · Human factors',t:'Audits show clinicians accept 99.6% of TriageMate’s suggestions without opening the rationale.',o:[
  {l:'Great. That proves it works.',d:{safety:-15,comp:-10},r:'A missed ectopic pregnancy case reveals nobody was checking.',les:'A very low override rate can signal automation bias (AI Act Art 14(4)(b)).'},
  {l:'Add training, show the rationale by default and require confirmation for high-risk accepts.',d:{safety:15,comp:10,speed:-5},r:'Override rate rises to 4%, mostly for good reasons.',les:'Human oversight must be designed, trained and measured.'}]},
 {b:'nhse',q:'Q10 · NHS commissioning',t:'An integrated care board wants TriageMate in its urgent care pathway. Your partner says: "It is already UKCA marked, so just switch it on."',o:[
  {l:'Agree and go live next week.',d:{comp:-25,safety:-10,cash:10},r:'The board\u2019s clinical safety officer refuses: there is no DCB0160 assessment, no DTAC submission and no DPIA for this deployment.',les:'A UKCA mark is not permission to deploy. NHS organisations need DTAC, DCB0129 evidence from you and their own DCB0160 assessment.'},
  {l:'Submit DTAC, share your DCB0129 safety case, and support the board\u2019s DCB0160 assessment and DPIA.',d:{comp:20,trust:10,speed:-10},r:'Go-live slips six weeks, but the board signs off and becomes a reference site.',les:'Deployment assurance is shared: you supply the evidence, the deploying organisation owns its local risk.'}]},
 {b:'clinic',q:'Q11 · Explainability',t:'A patient asks why TriageMate told them not to go to A&E and wants a human to review it.',o:[
  {l:'Send a template reply: "The algorithm is proprietary."',d:{trust:-15,comp:-15},r:'The patient complains to the ICO.',les:'GDPR gives rights to meaningful information about automated logic and to human review.'},
  {l:'Give the factors used, offer clinician review, and log it as feedback.',d:{trust:15,comp:10},r:'The clinician upholds the advice and the patient is satisfied.',les:'Explainability serves patients, regulators and your own error detection.'}]},
 {b:'nb',q:'Q12 · Year-end',t:'Your notified body asks for post-market surveillance data on real-world performance.',o:[
  {l:'Send the original validation study again.',d:{comp:-20},r:'Major non-conformity: no PMS data.',les:'Pre-market evidence does not replace post-market surveillance (MDR Art 83-86).'},
  {l:'Send your monitoring dashboard: accuracy by site and subgroup, drift, incidents and CAPAs.',d:{comp:20,trust:5},r:'Audit closes with no major findings.',les:'Monitoring built in from day one makes audits routine.'}]}
]
}
