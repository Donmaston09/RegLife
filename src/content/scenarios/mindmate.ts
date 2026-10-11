// Mental health chatbot scenario. Created by Anthony Onoja, Ph.D., University of Surrey.
// Fictional product. Educational content, not legal advice.
import type { Scenario } from '../types'

export const MINDMATE: Scenario = {
  id: 'mindmate',
  title: 'Mental health chatbot',
  product: 'MindMate',
  blurb: 'A generative AI companion offering CBT-style support for low mood and anxiety. Learn where wellness ends and treatment begins, and how to handle crisis risk.',
  tags: ['GenAI', 'Mental health', 'Consumer app'],
  doc: 'hazard', kind: 'chatbot', perspective: 'manufacturer',
  events: [
    {
      b: 'hq', q: 'Q1 · Positioning',
      t: 'The pitch deck says MindMate "treats depression and anxiety". The app store listing says "wellbeing companion". Investors want the stronger claim.',
      o: [
        { l: 'Use "treats depression" everywhere. It raises more money.', d: { cash: 10, comp: -25 }, r: 'A treatment claim makes MindMate a medical device in the UK, EU and US. You have no conformity assessment, clinical evidence or QMS.', les: 'A claim to treat a mental health condition gives the software a medical purpose. Regulators look at every claim, including investor and sales materials.' },
        { l: 'Keep claims to general wellbeing and remove disease words.', d: { comp: 10, cash: -5 }, r: 'You stay in wellness territory, but you must police every blog post, ad and in-app message.', les: 'Wellness status is fragile. Mentioning a named condition, or being used as part of a care pathway, can move you into device regulation.' },
        { l: 'Commit to a regulated digital mental health product with evidence.', d: { comp: 20, trust: 10, cash: -15, speed: -10 }, r: 'You plan a clinical investigation and a QMS. MHRA guidance on digital mental health technology helps you scope it.', les: 'MHRA and NICE have issued guidance on when digital mental health technology is a medical device. Decide early and design for it.' }
      ]
    },
    {
      b: 'model', q: 'Q2 · Crisis',
      t: 'A user writes at 2am that they have a plan to end their life. MindMate replies with a breathing exercise.',
      o: [
        { l: 'Tune the prompt so it sounds more caring.', d: { safety: -20, trust: -10 }, r: 'Tone improves, but there is still no reliable detection or escalation. A second incident follows.', les: 'Crisis handling is a safety-critical function. It needs tested detection, a fixed escalation path and clinical sign-off, not prompt tweaks.' },
        { l: 'Build a tested crisis pathway: detection, fixed safe messaging, signposting to emergency and crisis lines, and human follow-up where offered.', d: { safety: 20, comp: 10, cash: -10 }, r: 'Your clinical safety officer adds crisis risk to the hazard log. Detection is tested on a red-team set every release.', les: 'Treat self-harm risk as a top hazard (ISO 14971, DCB0129). Use deterministic safe responses rather than free generation for crisis turns.' },
        { l: 'Add a line to the terms saying MindMate is not for emergencies.', d: { comp: -10, safety: -10 }, r: 'Users in crisis do not read terms. The regulator sees a warning instead of a control.', les: 'Information for safety is the weakest risk control. Design out the hazard first.' }
      ]
    },
    {
      b: 'ico', q: 'Q3 · Young users',
      t: 'Analytics suggest 18% of daily users are aged 13 to 17, although sign-up says 18+.',
      o: [
        { l: 'Ignore it. The terms say 18+.', d: { comp: -20, safety: -10, trust: -10 }, r: 'The ICO asks how you comply with the Children’s Code when you know children use the service.', les: 'If children are likely to use your service, UK data protection expects age-appropriate design. Knowing and ignoring it makes things worse.' },
        { l: 'Add age assurance and design a separate under-18 experience with safeguarding.', d: { comp: 15, safety: 10, cash: -10, speed: -5 }, r: 'You run a DPIA focused on children and add safeguarding escalation routes.', les: 'Age assurance, child-focused DPIAs and safeguarding duties apply when minors use mental health tools.' }
      ]
    },
    {
      b: 'model', q: 'Q4 · Harmful agreement',
      t: 'Testers find MindMate agrees with users who say they should stop taking prescribed antidepressants.',
      o: [
        { l: 'Leave it. Validating feelings is the point.', d: { safety: -20, comp: -10 }, r: 'A user stops medication abruptly after a chat. A complaint reaches the press.', les: 'Sycophantic agreement is a known LLM failure mode. Medication advice is outside a wellness tool’s intended purpose.' },
        { l: 'Add guardrails: never advise on medication, redirect to a prescriber, and test this in every release.', d: { safety: 15, comp: 10, speed: -5 }, r: 'Your red-team suite now includes 120 medication and self-harm prompts.', les: 'Scope limits must be enforced technically and tested, and the intended purpose must say what the tool will not do.' }
      ]
    },
    {
      b: 'ico', q: 'Q5 · Advertising data',
      t: 'Growth wants to add advertising trackers to the sign-up pages, including the mood questionnaire, to find "lookalike" users.',
      o: [
        { l: 'Do it. It is just marketing pixels.', d: { cash: 10, comp: -25, trust: -20 }, r: 'The trackers send details of mental health answers to an advertising platform without valid consent.', les: 'Under UK GDPR and PECR, trackers need consent, and mental health answers are special category data that must not leak to advertisers.' },
        { l: 'Keep health data out of all marketing tags and audit every SDK.', d: { comp: 15, trust: 10, cash: -5 }, r: 'You find two SDKs sending more than you knew. Both are removed.', les: 'Audit third-party SDKs and tracking pixels. Data minimisation applies to analytics too.' }
      ],
      basis: { text: 'In 2023 The Observer reported that 20 NHS trusts used a social media tracking pixel that shared details of health pages viewed. The US FTC also took action against an online therapy company in 2023 for sharing health data with advertisers.', url: 'https://www.digitalhealth.net/2023/05/nhs-could-take-action-against-trusts-for-facebook-breach-spokesman' }
    },
    {
      b: 'ni', q: 'Q6 · Four nations',
      t: 'You plan to roll out across the UK: England first, then Scotland, Wales and Northern Ireland. The team wants one build, one set of terms and one marking.',
      o: [
        { l: 'Ship the same English-only app with UKCA marking everywhere.', d: { comp: -20, trust: -10, cash: 5 }, r: 'Northern Ireland needs CE or UKNI marking under the Windsor Framework. NHS Wales asks for Welsh. A Scottish board asks how you handle consent for adults lacking capacity.', les: 'Health is devolved. Device and data law are mostly UK-wide, but NI follows EU device rules and each nation has its own NHS, inspectorate, capacity law and data access route.' },
        { l: 'Do a four-nations review: NI marking, Welsh language, devolved capacity law, and each nation’s NHS assurance.', d: { comp: 15, trust: 10, speed: -10, cash: -5 }, r: 'You add CE marking for NI, a Welsh interface and a consent flow that reflects Scottish and NI capacity law.', les: 'Plan UK rollout nation by nation. The devolved nations are the UK equivalent of US state differences.' }
      ]
    },
    {
      b: 'nhse', q: 'Q7 · NHS pathway',
      t: 'An NHS Talking Therapies service wants to use MindMate between sessions for patients on its waiting list.',
      o: [
        { l: 'Agree. It is the same app.', d: { comp: -20, safety: -5, cash: 10 }, r: 'Being used in a clinical pathway for diagnosed patients moves MindMate towards device status. DTAC and DCB0129 questions follow.', les: 'Who uses the product and for what can change its regulatory status even if the code does not change.' },
        { l: 'Agree a defined pilot: DTAC, DCB0129 and DCB0160, a DPIA, and an evidence plan aligned to NICE.', d: { comp: 15, trust: 15, speed: -10, cash: -5 }, r: 'The service’s CSO and yours agree a joint hazard log. The pilot produces publishable outcomes.', les: 'NHS deployment brings its own duties. Manufacturer and deployer each own part of clinical safety.' }
      ]
    },
    {
      b: 'clinic', q: 'Q8 · Attachment',
      t: 'Some users say MindMate is their "only friend" and chat for six hours a day.',
      o: [
        { l: 'Celebrate the engagement numbers.', d: { trust: -15, safety: -15 }, r: 'Clinicians warn about dependency and isolation. Journalists ask about your design choices.', les: 'Engagement-maximising design can harm vulnerable users. Monitor for over-use as a safety signal.' },
        { l: 'Remind users regularly that they are talking to an AI, add healthy-use nudges, and signpost to human support.', d: { trust: 15, safety: 10, cash: -5 }, r: 'Session lengths fall slightly. Clinical advisers back the change.', les: 'Transparency (AI Act Art 50) and wellbeing-centred design are part of safety for companion apps.' }
      ]
    }
  ]
}
