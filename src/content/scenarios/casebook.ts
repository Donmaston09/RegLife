// Deployer casebook: an NHS trust adopting AI, built from anonymised real public cases.
// Created by Anthony Onoja, Ph.D., University of Surrey. Northfield NHS Trust is fictional.
// Each event is anonymised; the public case behind it is revealed after the learner decides.
import type { Scenario } from '../types'

export const CASEBOOK: Scenario = {
  id: 'casebook',
  title: 'NHS trust casebook (real cases)',
  product: 'Northfield NHS Trust',
  blurb: 'You lead digital clinical safety at a fictional trust buying and running AI tools. Every quarter is based on a real public case, revealed after you choose.',
  tags: ['Deployer', 'Real cases', 'UK'],
  doc: 'vendor', kind: 'other', perspective: 'deployer',
  events: [
    {
      b: 'hospital', q: 'Q1 · The vendor’s numbers',
      t: 'Your electronic record supplier offers a built-in sepsis prediction model. Its brochure quotes strong accuracy from the supplier’s own testing. The medical director wants it live across all wards next month.',
      o: [
        { l: 'Switch it on. The supplier has tested it.', d: { safety: -20, trust: -10, speed: 10 }, r: 'Clinicians are flooded with alerts, and many real sepsis cases are still missed. Alert fatigue sets in within weeks.', les: 'A supplier’s own figures are not evidence for your population. Validate locally before relying on a prediction model.' },
        { l: 'Run it silently for three months and compare it with real outcomes first.', d: { safety: 15, comp: 10, speed: -10 }, r: 'Local testing shows much weaker performance than the brochure. You agree a recalibration with the supplier before go-live.', les: 'Silent-mode local validation is the deployer’s best defence against overstated performance (DCB0160, GMLP).' }
      ],
      basis: { text: 'An independent hospital study (JAMA Internal Medicine, 2021) found a widely used proprietary sepsis model had an AUC of 0.63, missed about two-thirds of sepsis cases at the chosen threshold, and alerted on 18% of all patients. The supplier disputed the study’s configuration.', url: 'https://www.healthcareitnews.com/news/research-suggests-epic-sepsis-model-lacking-predictive-power' }
    },
    {
      b: 'ico', q: 'Q2 · Data for testing',
      t: 'A technology company offers to build a kidney-injury alert app for free. To test it, they ask for five years of records for every patient the trust has seen.',
      o: [
        { l: 'Share it all. It is for patient benefit.', d: { comp: -30, trust: -20 }, r: 'Patients were not told and could not object. The regulator finds the trust lacked a proper legal basis and shared far more than needed.', les: 'Patient benefit is not a legal basis. Testing a product with identifiable records needs a lawful basis, transparency and data minimisation.' },
        { l: 'Do a DPIA first, minimise the data, and use synthetic or limited data for testing.', d: { comp: 20, trust: 10, speed: -10 }, r: 'Testing takes longer, but the Caldicott Guardian signs off and patients are told how their data is used.', les: 'A DPIA before sharing, plus minimisation and transparency, is what the ICO expects.' }
      ],
      basis: { text: 'In 2017 the ICO found that an NHS trust did not comply with data protection law when it gave about 1.6 million patient records to a technology company to test a kidney injury app. Patients were not adequately informed and the volume went beyond what was needed.', url: 'https://www.digitalhealth.net/2017/07/royal-free-and-deepmind-did-not-comply-with-dpa-ico/' }
    },
    {
      b: 'soc', q: 'Q3 · A supplier is hacked',
      t: 'The supplier of your out-of-hours clinical system suffers a ransomware attack. The system is down for weeks and patient data has been taken.',
      o: [
        { l: 'Wait for the supplier to fix it. It is their system.', d: { safety: -20, comp: -15, trust: -10 }, r: 'Clinicians have no records out of hours and no tested paper fallback. You also learn the supplier did not use multi-factor authentication everywhere.', les: 'Deployers need a tested clinical fallback, and should check supplier security (MFA, patching, DSPT) before signing.' },
        { l: 'Switch to the tested fallback, work with the supplier on breach duties, and review all suppliers’ security assurances.', d: { safety: 15, comp: 10, cash: -10 }, r: 'Services continue on paper. Your supplier assurance checks now include multi-factor authentication and patching evidence.', les: 'Business continuity and supplier security assurance are part of safe deployment.' }
      ],
      basis: { text: 'A 2022 ransomware attack on a health software supplier disrupted NHS 111 and other services. The ICO fined the supplier £3.07 million in 2025, citing incomplete multi-factor authentication, inadequate patching and vulnerability scanning; data of 79,404 people was taken.', url: 'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/03/software-provider-fined-3m-following-2022-ransomware-attack/' }
    },
    {
      b: 'model', q: 'Q4 · Skin tone and accuracy',
      t: 'A respiratory monitoring device with an AI alert relies on pulse oximetry readings. A nurse asks whether it works as well for patients with darker skin.',
      o: [
        { l: 'Assume it is fine. It has a UKCA mark.', d: { safety: -20, trust: -15 }, r: 'Readings overestimate oxygen levels for some patients, so alerts come late for exactly those patients.', les: 'Regulatory marking does not guarantee equal performance. Ask for subgroup evidence.' },
        { l: 'Ask the supplier for performance by skin tone and ethnicity, and add guidance for clinicians.', d: { safety: 15, trust: 15, speed: -5 }, r: 'The supplier’s data shows a gap. You add clinical guidance and monitor outcomes by ethnicity.', les: 'Deployers should ask for subgroup performance before purchase and monitor it after.' }
      ],
      basis: { text: 'The UK Independent Review of Equity in Medical Devices (March 2024) found pulse oximeters can overestimate oxygen levels in people with darker skin, and warned of similar bias risks in AI. The government accepted its recommendations.', url: 'https://pharmaceutical-journal.com/article/news/uk-government-backs-all-recommendations-made-following-review-of-bias-in-medical-devices' }
    },
    {
      b: 'hospital', q: 'Q5 · Words nobody said',
      t: 'Outpatient clinics pilot an AI transcription and letter tool. To save storage, the supplier deletes the audio once the transcript is made.',
      o: [
        { l: 'Fine. Clinicians review the letters anyway.', d: { safety: -15, comp: -10 }, r: 'Letters occasionally contain phrases no one said. Without the audio, nobody can check what was really said.', les: 'Generative transcription can invent content. Deleting the source removes the ability to detect and investigate errors.' },
        { l: 'Keep audio for a short, defined period for checking, sample letters for errors, and report error rates.', d: { safety: 15, comp: 10, cash: -5 }, r: 'Sampling finds a small but real rate of invented text. The supplier fixes the worst cause.', les: 'Balance data minimisation against safety: keep what you need to verify outputs, for as short a time as possible, and document why.' }
      ],
      basis: { text: 'An Associated Press investigation (October 2024) reported that a widely used speech recognition model sometimes invented text, including in medical transcription tools, and that one medical product deleted the original audio.', url: 'https://fortune.com/2024/10/26/openai-transcription-tool-whisper-hallucination-rate-ai-tools-hospitals-patients-doctors' }
    },
    {
      b: 'clinic', q: 'Q6 · A chatbot for a helpline',
      t: 'An eating disorder service plans to replace part of its helpline with a chatbot to cut waiting times.',
      o: [
        { l: 'Launch it with a disclaimer.', d: { safety: -25, trust: -20, cash: 10 }, r: 'Within days users report it gave calorie-counting and weight-loss advice. The service takes it offline.', les: 'For vulnerable users, scope limits must be enforced and tested, not stated in a disclaimer.' },
        { l: 'Pilot it only alongside the human helpline, with strict scope limits, red-team testing and clinical review.', d: { safety: 15, trust: 10, speed: -10 }, r: 'Testing catches harmful advice before launch. The bot handles signposting only.', les: 'Keep humans in the loop for vulnerable groups, and test against the specific harms of the condition.' }
      ],
      basis: { text: 'In 2023 a US eating disorder charity took its chatbot offline after users reported it gave weight-loss and dieting advice.', url: 'https://www.kunc.org/npr-news/2023-06-08/an-eating-disorders-chatbot-offered-dieting-advice-raising-fears-about-ai-in-health' }
    },
    {
      b: 'nhse', q: 'Q7 · What the model predicts',
      t: 'Your integrated care board wants an algorithm to choose patients for a proactive care programme. The supplier’s model predicts future healthcare cost.',
      o: [
        { l: 'Use it. High cost means high need.', d: { safety: -15, trust: -20 }, r: 'Groups who use services less, for reasons of access rather than health, are under-selected despite being just as ill.', les: 'Check what the model actually predicts. A proxy like cost can carry existing inequalities straight into decisions.' },
        { l: 'Ask what the target variable is, test selection rates by group, and use a health-based target.', d: { trust: 15, safety: 10, speed: -5 }, r: 'Switching to a health-need target changes who is selected. You document the equality impact.', les: 'Target choice is a fairness decision. Include it in your equality impact assessment.' }
      ],
      basis: { text: 'A 2019 study in Science found a widely used US population health algorithm under-identified Black patients because it predicted healthcare cost rather than health need.', url: 'https://chmi.berkeley.edu/news/dissecting-racial-bias-in-an-algorithm-used-to-manage-the-health-of-populations' }
    },
    {
      b: 'ico', q: 'Q8 · The website tracker',
      t: 'Your communications team adds an advertising tracker to the trust website to measure campaign reach. It records which pages people visit, including condition and appointment pages.',
      o: [
        { l: 'Keep it. It is standard marketing.', d: { comp: -25, trust: -20 }, r: 'Journalists find the tracker sends details of health page visits to a social media company.', les: 'Page visits about conditions can be health data. Trackers need consent under PECR and must not leak special category data.' },
        { l: 'Remove it, audit all trackers, and use privacy-friendly analytics with consent.', d: { comp: 20, trust: 10, cash: -5 }, r: 'The audit finds two more trackers. All are removed and the cookie banner is fixed.', les: 'Audit every third-party script on patient-facing sites and apps.' }
      ],
      basis: { text: 'In 2023 The Observer reported that 20 NHS trusts used a social media tracking pixel that shared details of pages viewed, including about conditions and appointments. NHS England said it could take further action.', url: 'https://www.digitalhealth.net/2023/05/nhs-could-take-action-against-trusts-for-facebook-breach-spokesman' }
    }
  ]
}
