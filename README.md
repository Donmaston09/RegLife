# RegLife

A 3D city for learning how digital health AI is regulated in the UK, EU and US.

**Created by Anthony Onoja, Ph.D.**, School of Health Sciences, University of Surrey, United Kingdom · donmaston09@gmail.com

The focus is the UK, and especially the NHS organisations that buy and run AI. The EU is covered because it applies in Northern Ireland and to many suppliers; the US appears only through the FDA as a comparison.

Learners walk a fictional AI product around a city of regulators (MHRA, ICO, NHS England, NICE, Scotland, Wales and Northern Ireland, notified bodies, the EU AI Office, data protection authorities, the FDA as an international comparison), a hospital, a patients' forum and a court. On the way they learn:

- where the legal boundaries sit and when software becomes a medical device
- how a change in use or design changes regulatory status
- how to monitor a live product, and the incident reporting deadlines
- who needs to be involved (RACI)
- how rules differ across England, Scotland, Wales and Northern Ireland (devolved health systems, the Windsor Framework, Welsh language duties, capacity law, data access routes)
- how risks such as prompt injection, hallucination, bias, black-box decisions and cyber attacks link to legal duties

Educational tool, not legal advice. Content reflects public rules and guidance as of mid-2026.

## Features

| Area | What it does |
|---|---|
| 3D city | A 2D map is used automatically on devices without WebGL, and anyone can switch to it. Three.js (react-three-fiber) city with clickable buildings, a moving avatar and a day/night theme that follows the device. Pins are real HTML buttons, so the city works with a keyboard and screen readers. A Directory lists every building. |
| Tools | Device classifier, change impact checker, risk register, monitoring, RACI, 37-item framework library, regulator profiles. |
| Deployer office | The duties of the NHS organisation that deploys AI: a before-you-buy to while-it-is-live checklist across the four UK nations. |
| Drill Hall | 13 "is this a trigger?" drills from the deployer's side. Learners pick a response level and say how sure they are, then see the expert reasoning, actions and sources. Answers given as "certain" that differ from the experts are flagged for discussion. |
| Records Office | Take-away work documents pre-filled from what the learner did: a change impact log entry, a DCB0129/DCB0160-style hazard log line (with CSV row) and a list of questions for the supplier. Downloads open in Word. |
| Scenarios | Five simulations. **Northfield NHS Trust casebook**: eight quarters from the deployer's side, each based on an anonymised real public case that is revealed, with its source, after the learner decides. Plus four manufacturer scenarios, several with real-case reveals: **TriageMate** (GenAI symptom triage), **MindMate** (mental health chatbot), **LungSight** (chest X-ray imaging AI), **ScribeWell** (ambient voice scribe). |
| Accounts | With Supabase connected, visitors see a welcome page and must create an account (name, optional organisation, email, privacy consent) or sign in before using the app. Email sign-in with a typed 6-digit code (or link) through Supabase Auth. Guest progress is merged into the account on first sign-in. Learners can download their data or delete their account. |
| Saved progress | Buildings visited, classifier answers, planned changes and every scenario run. |
| Cohorts | Educators create a cohort and share a 6-character code or join link. |
| Educator dashboard | Learners, activity, city explored, best score per scenario, weakest area, drill answers matching experts, confident-but-different answers, documents made, average score by scenario, CSV export. Educators only see data from the date each learner joined. |

Without Supabase settings the app runs in **guest mode**: everything works except accounts, cohorts and the dashboard, and progress is kept in the browser.

## Run it locally

Requires Node 18 or later.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit and content-integrity tests
npm run build      # production build in dist/
```

## Turn on accounts and cohorts (Supabase)

1. Create a free project at supabase.com. A UK or EU region is a sensible default for UK learners.
2. Open **SQL Editor** and run the files in `supabase/migrations/` in order: `0001_init.sql`, `0002_account_rights.sql`, `0003_drills_docs.sql`, `0004_signup_profile.sql`.
3. In **Authentication > URL Configuration**, set the Site URL to where the app runs (`http://localhost:5173` while testing, then your Render address) and add the same under Redirect URLs.
4. In **Authentication > Email Templates > Magic Link**, make sure the email shows the code: add a line such as `Your RegLife code: {{ .Token }}`. Learners type this code, which avoids the "link expired" problem caused by NHS and university email scanners.
5. In **Authentication > SMTP Settings**, connect a real email service before any class. Supabase's built-in sender is for testing and only sends a few emails an hour.
6. Copy `.env.example` to `.env.local` and fill in **Project URL** and **anon public key** from **Project Settings > API**.
7. Restart `npm run dev`. "Sign in" appears in the top bar.

The anon key is designed to be public. All access control is enforced by row level security in the database:

- learners can read and write only their own profile, progress and runs
- cohort owners read learner data only through `cohort_report()`, which returns nothing to anyone else and only includes runs made after the learner joined
- outsiders see no cohorts or memberships

`supabase/tests/rls_check.sql` re-runs these checks against a plain Postgres database.

## Deploy on Render

The repository includes `render.yaml`, a Render Blueprint for a free static site.

1. Push this project to GitHub or GitLab.
2. In Render, choose **New > Blueprint** and connect the repository. Render reads `render.yaml`.
3. When asked, paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, or leave them blank for guest mode. These are baked in at build time, so if you change them later, trigger **Manual Deploy > Clear build cache & deploy**.
4. After the first deploy, copy your site address (for example `https://reglife.onrender.com`) into Supabase under **Authentication > URL Configuration** as the Site URL and a Redirect URL. Sign-in links will not work until you do this.
5. Optional: add your own domain under the site's **Settings > Custom Domains**.

The Blueprint rewrites every path to `index.html` so links such as `/educator` and `/join/ABC234` work, caches built assets for a year, and pins Node 20. Static sites on Render do not sleep, unlike free web services.

Any other static host also works if it rewrites unknown paths to `index.html`.

## Project layout

```
src/
  content/            all teaching content as typed data (edit here, not in components)
    scenarios/        one file per scenario pack
  three/City.tsx      the 3D city
  ui/views.tsx        building panels
  pages/              city, sign-in, account, join, educator dashboard
  lib/                classifier, scoring, progress sync, Supabase client, cohorts
supabase/
  migrations/         database schema and security rules
  tests/              row level security check
```

### Adding a scenario

Copy `src/content/scenarios/mindmate.ts`, change the id and events, and add it to `src/content/scenarios/index.ts`. Each event's `b` must be a building id from `src/content/city.ts`; `npm test` checks this.

### Keeping content current

Regulation in this area changes often. Each review cycle, check the framework library, the dates on notice boards and in the news ticker (`src/pages/CityPage.tsx`) and the regulator profiles, and record the review date. In particular, watch the EU AI Act Digital Omnibus timetable, MHRA software reforms, FDA AI guidance, and differences between England, Scotland, Wales and Northern Ireland.

## Privacy notes for a pilot

- Data stored: email (Supabase Auth), display name, organisation, buildings visited, classifier answers, planned changes and scenario results.
- Publish a privacy notice and get ethics approval before using learner data for research.
- No analytics or tracking are included, and fonts are served by the app itself rather than Google.
- Learners can download their data and delete their account from the Account page.
- The educator CSV export neutralises spreadsheet formulas in learner-entered text.

## Credits

Concept, content and direction: Anthony Onoja, Ph.D., University of Surrey. City format inspired by Lagos Life. Built with React, Three.js, react-three-fiber, drei and Supabase.

## Real cases used

Casebook events and some scenario events are based on these public reports. They are anonymised in play and revealed after the learner decides. Check each against its primary source during content review.

- Sepsis model external validation (JAMA Internal Medicine, 2021) · [report](https://www.healthcareitnews.com/news/research-suggests-epic-sepsis-model-lacking-predictive-power)
- ICO finding on an NHS trust sharing 1.6 million records to test an app (2017) · [report](https://www.digitalhealth.net/2017/07/royal-free-and-deepmind-did-not-comply-with-dpa-ico/)
- ICO fine after a 2022 ransomware attack on a health software supplier (2025) · [ICO](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/03/software-provider-fined-3m-following-2022-ransomware-attack/)
- Independent Review of Equity in Medical Devices (2024) · [report](https://pharmaceutical-journal.com/article/news/uk-government-backs-all-recommendations-made-following-review-of-bias-in-medical-devices)
- Speech recognition inventing text in medical transcription (AP, 2024) · [report](https://fortune.com/2024/10/26/openai-transcription-tool-whisper-hallucination-rate-ai-tools-hospitals-patients-doctors)
- Eating disorder helpline chatbot taken offline (2023) · [report](https://www.kunc.org/npr-news/2023-06-08/an-eating-disorders-chatbot-offered-dieting-advice-raising-fears-about-ai-in-health)
- Population health algorithm using cost as a proxy for need (Science, 2019) · [summary](https://chmi.berkeley.edu/news/dissecting-racial-bias-in-an-algorithm-used-to-manage-the-health-of-populations)
- NHS trust websites sharing page-visit data through a tracking pixel (2023) · [report](https://www.digitalhealth.net/2023/05/nhs-could-take-action-against-trusts-for-facebook-breach-spokesman)
