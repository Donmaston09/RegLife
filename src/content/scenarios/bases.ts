// Real public cases behind events in the original scenarios, revealed after the learner decides.
import type { CaseBasis } from '../types'

const ADVANCED: CaseBasis = { text: 'A 2022 ransomware attack on a health software supplier disrupted NHS 111. The ICO fined the supplier £3.07 million in 2025, citing incomplete multi-factor authentication and patching.', url: 'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/03/software-provider-fined-3m-following-2022-ransomware-attack/' }
const ROYAL_FREE: CaseBasis = { text: 'In 2017 the ICO found an NHS trust broke data protection law by giving about 1.6 million patient records to a technology company to test an app without adequately informing patients.', url: 'https://www.digitalhealth.net/2017/07/royal-free-and-deepmind-did-not-comply-with-dpa-ico/' }
const EQUITY: CaseBasis = { text: 'The UK Independent Review of Equity in Medical Devices (March 2024) found bias in pulse oximeters for people with darker skin and warned of similar risks in AI.', url: 'https://pharmaceutical-journal.com/article/news/uk-government-backs-all-recommendations-made-following-review-of-bias-in-medical-devices' }
const WHISPER: CaseBasis = { text: 'An Associated Press investigation (October 2024) reported that a widely used speech recognition model sometimes invented text, including in medical transcription tools.', url: 'https://fortune.com/2024/10/26/openai-transcription-tool-whisper-hallucination-rate-ai-tools-hospitals-patients-doctors' }
const TESSA: CaseBasis = { text: 'In 2023 a US eating disorder charity took its chatbot offline after users reported it gave weight-loss and dieting advice.', url: 'https://www.kunc.org/npr-news/2023-06-08/an-eating-disorders-chatbot-offered-dieting-advice-raising-fears-about-ai-in-health' }
const SEPSIS: CaseBasis = { text: 'An independent hospital study (JAMA Internal Medicine, 2021) found a widely used sepsis model performed far worse locally than its supplier reported.', url: 'https://www.healthcareitnews.com/news/research-suggests-epic-sepsis-model-lacking-predictive-power' }

/** scenario id -> event index -> basis */
export const BASES: Record<string, Record<number, CaseBasis>> = {
  triagemate: { 4: EQUITY, 6: ROYAL_FREE, 7: ADVANCED },
  mindmate: { 3: TESSA },
  lungsight: { 1: SEPSIS, 5: EQUITY },
  scribewell: { 1: WHISPER, 6: ADVANCED }
}
