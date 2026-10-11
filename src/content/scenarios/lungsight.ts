// Imaging AI scenario. Created by Anthony Onoja, Ph.D., University of Surrey.
// Fictional product. Educational content, not legal advice.
import type { Scenario } from '../types'

export const LUNGSIGHT: Scenario = {
  id: 'lungsight',
  title: 'Chest X-ray imaging AI',
  product: 'LungSight',
  blurb: 'A deep learning model that flags urgent findings on chest X-rays so radiologists read them first. See how scanners, populations and autonomy change the rules.',
  tags: ['Imaging', 'Device', 'Radiology'],
  doc: 'change', kind: 'imaging', perspective: 'manufacturer',
  events: [
    {
      b: 'hq', q: 'Q1 · Classification',
      t: 'A co-founder argues LungSight is "just decision support", so it does not need regulatory approval.',
      o: [
        { l: 'Agree and sell it as decision support.', d: { comp: -30, cash: 10 }, r: 'Software that analyses medical images is a device function in the US (it fails the first CDS criterion) and a device under EU and UK rules.', les: 'Image and signal analysis is the clearest line in SaMD regulation. It is regulated everywhere.' },
        { l: 'Plan for device status: Rule 11 classification in the EU and UK, and a 510(k) with a suitable predicate in the US.', d: { comp: 20, cash: -10, speed: -10 }, r: 'Your regulatory lead maps the pathway and the clinical evidence you need.', les: 'Triage and prioritisation tools for imaging are typically Class IIa or IIb in the EU, and are often cleared as computer-aided triage in the US.' }
      ]
    },
    {
      b: 'hospital', q: 'Q2 · New scanner',
      t: 'A customer hospital replaces its X-ray machines with a different vendor’s. Your model was never validated on those images.',
      o: [
        { l: 'Keep running. Pixels are pixels.', d: { safety: -20, comp: -10 }, r: 'Sensitivity for pneumothorax drops by 9 points on the new images. Nobody notices for two months.', les: 'Changes in acquisition hardware cause domain shift. Validated equipment should be in your instructions for use.' },
        { l: 'Pause at that site, run a local validation, and update the list of validated scanners.', d: { safety: 15, comp: 10, cash: -5 }, r: 'Performance is acceptable after recalibration. You add a site acceptance test to onboarding.', les: 'Site-level validation and monitoring by scanner model are core post-market controls for imaging AI.' }
      ]
    },
    {
      b: 'lab', q: 'Q3 · Children',
      t: 'A children’s hospital asks to use LungSight on paediatric X-rays.',
      o: [
        { l: 'Switch it on. Lungs are lungs.', d: { safety: -15, comp: -20 }, r: 'Paediatric anatomy and disease patterns differ. You have no evidence and the use is outside your intended purpose.', les: 'A new patient population is a significant change. It needs evidence and, in most cases, a new assessment.' },
        { l: 'Decline for now and design a paediatric study and change submission.', d: { comp: 15, safety: 10, speed: -5 }, r: 'The hospital joins as a study site.', les: 'Evidence first, then the regulatory change, then release.' }
      ]
    },
    {
      b: 'nb', q: 'Q4 · Autonomy',
      t: 'Hospitals ask for a mode that automatically reports clearly normal X-rays without a radiologist reading them.',
      o: [
        { l: 'Ship it as a configuration flag.', d: { comp: -30, safety: -15, cash: 15 }, r: 'Removing the human read changes the intended purpose and risk class. Your certificate does not cover it.', les: 'Moving from triage to autonomous reporting is a major change in intended purpose and risk. It needs a new conformity assessment.' },
        { l: 'Treat it as a new product: higher-class assessment, prospective study and clear safety thresholds.', d: { comp: 20, safety: 10, speed: -15, cash: -10 }, r: 'It takes 18 months but you can now market autonomous normal reporting with strong evidence.', les: 'Autonomous imaging AI is possible in some markets, but only with higher-class assessment and robust prospective evidence.' }
      ]
    },
    {
      b: 'fda', q: 'Q5 · Retraining',
      t: 'You have 200,000 new labelled images and want to retrain every quarter.',
      o: [
        { l: 'Retrain and release. Accuracy went up.', d: { comp: -20, speed: 10 }, r: 'Without a PCCP, FDA expects a new 510(k) for a change that could significantly affect performance.', les: 'Better average accuracy can still hide worse subgroup performance. Uncontrolled retraining is an uncontrolled design change.' },
        { l: 'Submit a PCCP describing the data, retraining method, acceptance criteria and rollback.', d: { comp: 20, speed: -5, cash: -5 }, r: 'FDA authorises the PCCP. Future retrains inside its limits need no new submission.', les: 'A Predetermined Change Control Plan lets planned model updates proceed within agreed limits.' }
      ]
    },
    {
      b: 'model', q: 'Q6 · Subgroups',
      t: 'Your subgroup analysis shows lower sensitivity on portable AP films from intensive care, where patients are sickest.',
      o: [
        { l: 'Report only the overall figure.', d: { safety: -15, trust: -15, comp: -10 }, r: 'An independent evaluation publishes the gap.', les: 'Report performance by acquisition type, setting and demographic group. Averages hide clinically important gaps.' },
        { l: 'Publish the subgroup results, state the limitation in the IFU, and collect more ICU data.', d: { trust: 15, comp: 10, safety: 10, cash: -5 }, r: 'Radiologists know when to rely on the tool less. The next version narrows the gap.', les: 'Transparency about limitations is a regulatory expectation and a safety control.' }
      ]
    },
    {
      b: 'soc', q: 'Q7 · PACS link',
      t: 'A penetration test finds your DICOM gateway accepts images from any device on the hospital network.',
      o: [
        { l: 'It is behind the hospital firewall. Leave it.', d: { comp: -15, safety: -10 }, r: 'Your FDA cybersecurity documentation now looks incomplete.', les: 'FDA expects a threat model, SBOM and patch plan for cyber devices (§524B). Hospital networks are not trusted by default.' },
        { l: 'Add authentication, an allow-list and logging; update the SBOM and threat model.', d: { comp: 15, safety: 5, cash: -5 }, r: 'The fix ships as a cybersecurity update with documentation.', les: 'Security fixes with no performance change usually need no new submission, but must be documented.' }
      ]
    },
    {
      b: 'tower', q: 'Q8 · Over-reliance',
      t: 'Radiologists at one site now skip images that LungSight labels "low priority" on busy days.',
      o: [
        { l: 'That is the efficiency gain hospitals pay for.', d: { safety: -20, comp: -10 }, r: 'A missed lung nodule in a "low priority" film leads to a complaint and an incident report.', les: 'Triage tools re-order the worklist. They must not become a reason to skip reads unless authorised for that purpose.' },
        { l: 'Work with the site on training, monitor turnaround times for low-priority films, and restate the intended use.', d: { safety: 15, trust: 10 }, r: 'The site adds a maximum wait time for low-priority studies.', les: 'Deployers must use the tool as intended. Manufacturers should monitor for foreseeable misuse.' }
      ]
    }
  ]
}
