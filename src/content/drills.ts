// "Is this a trigger?" drills, written from the UK deployer's side.
// Created by Anthony Onoja, Ph.D., University of Surrey. Educational content, not legal advice.
// Expert reasoning reflects public rules and guidance as of mid-2026 and should be checked by the content panel.
import type { Drill } from './types'

export const LEVELS = [
  { short: 'Record it', long: 'Record it and carry on. No new assessment needed.' },
  { short: 'Assess before use', long: 'Assess and document locally, and get evidence from the supplier, before using it this way.' },
  { short: 'Stop and escalate', long: 'Stop or hold. A new regulatory assessment, approval or supplier action is needed first.' }
] as const

export const DRILLS: Drill[] = [
  {
    id: 'scribe-model-update', title: 'Scribe supplier swaps the language model', role: 'Clinical safety officer, acute trust', nation: 'England',
    context: 'Your trust uses an ambient scribe that drafts clinic letters. It is registered with the MHRA as a Class I device.',
    change: 'Release notes say the supplier has moved to a newer language model for "better summaries". Go-live is Monday.',
    answer: 1,
    reasoning: 'Changing the underlying model changes how the device works, so the supplier must assess whether it is a significant change and update its own safety case (DCB0129). Your trust is not the manufacturer, but under DCB0160 you must assess the change before using it, and you cannot do that without the supplier’s evidence.',
    actions: ['Ask for the updated DCB0129 safety case and the supplier’s significance decision', 'Re-run your local acceptance tests on real letter types', 'Update your DCB0160 hazard log and brief users'],
    refs: [{ text: 'NHS England guidance on ambient voice technology (2025)', url: 'https://www.england.nhs.uk/' }, { text: 'DCB0160 clinical risk management', url: 'https://digital.nhs.uk/data-and-information/information-standards' }]
  },
  {
    id: 'sepsis-children', title: 'Adult sepsis alert used on teenagers', role: 'Emergency department lead', nation: 'England',
    context: 'An early-warning tool for sepsis is in use in your emergency department. Its intended purpose covers adults aged 18 and over.',
    change: 'Registrars have started switching it on for 15 to 17-year-olds because "it seems to work".',
    answer: 2,
    reasoning: 'This is use outside the intended purpose. The evidence and the manufacturer’s conformity assessment do not cover children, and the trust takes on risk, and possibly manufacturer-like liability, if it deliberately extends the use. Stop the off-label use, report it through clinical governance, and raise it with the supplier.',
    actions: ['Stop paediatric use and tell staff why', 'Record it as an incident and review cases already affected', 'Ask the supplier whether paediatric evidence or a change is planned'],
    refs: [{ text: 'MHRA guidance on intended purpose for software as a medical device', url: 'https://www.gov.uk/government/collections/software-and-artificial-intelligence-ai-as-a-medical-device' }]
  },
  {
    id: 'threshold-in-range', title: 'Alert threshold changed within the supplier’s range', role: 'Digital clinical safety officer', nation: 'Wales',
    context: 'A deterioration score lets each site set its alert threshold between 5 and 7. The instructions for use document this.',
    change: 'Ward managers want to move from 5 to 6 to reduce alarm fatigue.',
    answer: 1,
    reasoning: 'Configuring within the documented range is intended use, so no new regulatory assessment is needed. It still changes clinical risk: fewer alerts means some deteriorating patients may be flagged later. Assess and document it locally, with clinical sign-off and monitoring.',
    actions: ['Model the effect on sensitivity using local data', 'Get clinical sign-off and update the hazard log', 'Monitor missed deteriorations for three months'],
    refs: [{ text: 'DCB0160 clinical risk management', url: 'https://digital.nhs.uk/data-and-information/information-standards' }]
  },
  {
    id: 'threshold-out-of-range', title: 'Alert threshold set outside the supplier’s range', role: 'Digital clinical safety officer', nation: 'England',
    context: 'The same deterioration score allows thresholds from 5 to 7.',
    change: 'Your informatics team has found a way to set the threshold to 9 in the database.',
    answer: 2,
    reasoning: 'Setting it outside the documented range means using the device in a way its manufacturer has not validated. The trust would effectively be modifying a medical device and could take on manufacturer responsibilities. Do not deploy it. Ask the supplier to validate and support the change if it is needed.',
    actions: ['Do not deploy the change', 'Raise a formal change request with the supplier', 'Check no local workarounds already exist'],
    refs: [{ text: 'MHRA: software and AI as a medical device', url: 'https://www.gov.uk/government/collections/software-and-artificial-intelligence-ai-as-a-medical-device' }]
  },
  {
    id: 'hosting-move', title: 'Supplier moves hosting from the UK to the US', role: 'Data protection officer', nation: 'Scotland',
    context: 'A triage tool used by an NHS Scotland board stores conversation data in a UK data centre.',
    change: 'The supplier gives 30 days’ notice that hosting is moving to a US cloud region.',
    answer: 1,
    reasoning: 'This is a data protection change, not a device change. It is an international transfer of special category data, so the board must review the DPIA, check the transfer mechanism (for example the UK Extension to the EU-US Data Privacy Framework or an IDTA), and update contracts and privacy information before the move.',
    actions: ['Review and update the DPIA', 'Confirm the transfer mechanism and supplier security assurances', 'Update privacy information for patients'],
    refs: [{ text: 'ICO guidance on international transfers', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/' }]
  },
  {
    id: 'new-scanners', title: 'New CT scanners feed the imaging AI', role: 'Radiology services manager', nation: 'England',
    context: 'An AI tool prioritises head CT scans for suspected bleeds. It was validated on your current scanners.',
    change: 'The trust is replacing the scanners with a different manufacturer’s model next month.',
    answer: 1,
    reasoning: 'Image characteristics change with hardware, which can quietly reduce performance. Check that the new scanner is listed as compatible in the instructions for use, and run local validation before relying on the AI with the new images.',
    actions: ['Check the instructions for use list the new scanner model', 'Run the AI in silent mode on new images and compare with radiologist reads', 'Agree with the supplier how performance will be monitored'],
    refs: [{ text: 'GMLP guiding principles (MHRA, FDA, Health Canada)', url: 'https://www.gov.uk/government/publications/good-machine-learning-practice-for-medical-device-development-guiding-principles' }]
  },
  {
    id: 'scribe-diagnosis', title: 'Scribe adds suggested diagnoses', role: 'Chief clinical information officer', nation: 'England',
    context: 'Your ambient scribe drafts notes and letters.',
    change: 'The supplier’s next release adds a panel of suggested diagnoses and coding.',
    answer: 2,
    reasoning: 'Suggesting diagnoses is a new intended purpose. It is likely to move the product into a higher risk class and needs the manufacturer’s new conformity assessment before release. Do not switch on the feature until the supplier shows it is covered, and complete a fresh DCB0160 assessment.',
    actions: ['Ask for evidence that the new feature is covered by the product’s regulatory status', 'Keep the feature switched off until then', 'Plan a new DCB0160 assessment and user training'],
    refs: [{ text: 'MDCG 2019-11 on qualification and classification of software', url: 'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en' }]
  },
  {
    id: 'typo-patch', title: 'Typo fix and security patch', role: 'IT change manager', nation: 'Northern Ireland',
    context: 'A clinical decision support tool is in use across a Northern Ireland trust.',
    change: 'The supplier releases a patch that fixes a spelling mistake and closes a security vulnerability. Outputs do not change.',
    answer: 0,
    reasoning: 'No change to intended purpose or clinical performance. Record it through normal IT change control. Apply security patches promptly: delaying them is a bigger risk.',
    actions: ['Apply through standard change control', 'Keep the release notes with your records'],
    refs: [{ text: 'NHS Data Security and Protection Toolkit', url: 'https://www.dsptoolkit.nhs.uk/' }]
  },
  {
    id: 'train-own-model', title: 'Using the tool’s logs to train your own model', role: 'Head of data science, trust', nation: 'England',
    context: 'A triage tool logs every patient conversation. The trust has access to the logs.',
    change: 'Your team wants to use two years of logs to build its own prediction model.',
    answer: 2,
    reasoning: 'This is a new purpose for confidential patient information. You need a lawful basis and an Article 9 condition, a DPIA, Caldicott Guardian approval, and you must apply the national data opt-out. If the work is research, it may need HRA approval, and without consent possibly section 251 support. Do not start until these are in place.',
    actions: ['Complete a DPIA and get Caldicott Guardian sign-off', 'Decide whether it is research and seek HRA approval if so', 'Apply the national data opt-out and minimise the data'],
    refs: [{ text: 'Health Research Authority: data-driven technology', url: 'https://www.hra.nhs.uk/planning-and-improving-research/research-planning/how-were-supporting-data-driven-technology/' }, { text: 'Real case: an NHS trust shared 1.6 million records to test an app without an adequate legal basis (ICO, 2017)', url: 'https://www.digitalhealth.net/2017/07/royal-free-and-deepmind-did-not-comply-with-dpa-ico/' }]
  },
  {
    id: 'wales-rollout', title: 'Rolling out to a Welsh health board', role: 'Supplier implementation lead', nation: 'Wales',
    context: 'A patient-facing symptom checker is live in two English trusts.',
    change: 'A Welsh health board wants it next quarter, as is.',
    answer: 1,
    reasoning: 'Device status is UK-wide, so no new device assessment is needed. But NHS Wales bodies must meet the Welsh Language Standards for patient-facing services, and the board will run its own clinical safety, information governance and procurement assurance.',
    actions: ['Plan a Welsh-language version of patient-facing content', 'Provide your safety case and DTAC evidence to the board', 'Agree the data processing terms with the board'],
    refs: [{ text: 'Welsh Language Commissioner', url: 'https://www.welshlanguagecommissioner.wales/' }]
  },
  {
    id: 'ni-ukca', title: 'A UKCA-only device for Northern Ireland', role: 'Procurement lead, Northern Ireland trust', nation: 'Northern Ireland',
    context: 'You are buying an AI imaging device that is UKCA marked.',
    change: 'The supplier says UKCA marking covers the whole UK.',
    answer: 2,
    reasoning: 'Under the Windsor Framework, Northern Ireland follows EU medical device rules. Devices placed on the NI market need CE marking, or UKNI marking with a UK notified body. UKCA alone is not enough. Hold the purchase until the supplier confirms the right marking.',
    actions: ['Ask for evidence of CE or UKNI marking', 'Hold the contract until it is provided'],
    refs: [{ text: 'UK government: regulating medical devices in the UK', url: 'https://www.gov.uk/guidance/regulating-medical-devices-in-the-uk' }]
  },
  {
    id: 'fsn', title: 'Field safety notice for a feature you use', role: 'Medical devices safety officer', nation: 'Scotland',
    context: 'A risk prediction tool is used on three wards.',
    change: 'The supplier issues a field safety notice telling users to stop using one of its scores until a fix is released.',
    answer: 2,
    reasoning: 'A field safety notice is a corrective action. Act on it straight away: stop using the affected score, confirm the action to the supplier, and record it. In Scotland, adverse incidents are also reported to the Incident Reporting and Investigation Centre (IRIC).',
    actions: ['Stop using the affected score and tell staff', 'Confirm the action to the supplier', 'Review recent decisions that relied on it'],
    refs: [{ text: 'MHRA: field safety notices', url: 'https://www.gov.uk/drug-device-alerts' }]
  },
  {
    id: 'gp-chatbot', title: 'GP practice uses a free chatbot for patient letters', role: 'GP practice manager', nation: 'England',
    context: 'A busy GP practice wants to save time on patient correspondence.',
    change: 'Clinicians start pasting consultation notes into a free consumer chatbot to draft letters with advice to patients.',
    answer: 2,
    reasoning: 'Patient data is going to a third party with no contract, DPIA or assurance, and the tool has no clinical safety case. Stop it, assess what data has been shared, and look at assured options that come with a DPIA, DTAC evidence and a clinical safety case.',
    actions: ['Stop the practice now and tell staff why', 'Assess what has been shared and whether it is a reportable breach', 'Look for an assured tool with a DPIA, DTAC and DCB0129 evidence'],
    refs: [{ text: 'ICO guidance on AI and data protection', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/' }]
  }
]
