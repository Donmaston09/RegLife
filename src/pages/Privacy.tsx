// Plain-English privacy notice (draft: to be reviewed by the University's data protection officer).
import Shell from './Shell'

export default function Privacy() {
  return (
    <Shell eyebrow="Privacy" title="Privacy notice">
      <div className="card stack" style={{ maxWidth: 760 }}>
        <p><b>Draft for review.</b> This notice must be checked by the University of Surrey's data protection team before RegLife is used with learners.</p>
        <h3>Who is responsible</h3><p>RegLife is run by Anthony Onoja, Ph.D., School of Health Sciences, University of Surrey (donmaston09@gmail.com).</p>
        <h3>What we collect</h3><ul className="tight"><li>Your email address, name and, if you give it, your organisation or course</li><li>What you do in RegLife: buildings visited, classifier answers, changes you select, drill answers, scenario results and the types of document you make</li></ul>
        <p>We do not collect patient data. Do not type patient information into RegLife.</p>
        <h3>Why</h3><p>To give you an account, save your progress, and, if you join a cohort, show your educator your progress from the date you joined. Our lawful basis is legitimate interests in providing education.</p>
        <h3>Who can see it</h3><p>Only you, and the owner of any cohort you choose to join. Data is stored with Supabase. We do not use advertising or tracking cookies.</p>
        <h3>Your rights</h3><p>You can download your data or delete your account at any time from your Account page. You can also contact us, or complain to the Information Commissioner's Office.</p>
      </div>
    </Shell>
  )
}
