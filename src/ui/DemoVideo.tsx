// The narrated, captioned video tour of RegLife. Created by Anthony Onoja, Ph.D., University of Surrey.
// The video is narrated, with captions burned in; the steps below are its text alternative.
export const DEMO_SRC = '/demo/reglife-demo.mp4'
export const DEMO_POSTER = '/demo/reglife-demo-poster.jpg'

export const DEMO_STEPS: [string, string][] = [
  ['Create an account', 'Your name, optional organisation, email and a password. You confirm your email once with a 6-digit code, then sign in with your email and password.'],
  ['Explore the city', 'Drag to move, scroll to zoom and tap any building. Prefer a flat map? Use the 2D button.'],
  ['Classify a product', 'In Product HQ, ten questions show whether a product is likely to be a medical device, and which NHS rules apply.'],
  ['Practise in the Drill Hall', 'Decide how big a response a change needs and how sure you are, then compare with the expert view.'],
  ['Play your year', 'The NHS trust casebook is built from real public cases. After each choice you see the lesson and the real case behind it.'],
  ['Take it to work', 'The Records Office turns what you practised into a change log, hazard log line or supplier questions you can download for Word.'],
  ['Stay current', 'Tap the green news bar for recent and coming rule changes. Spotted a mistake? Use "Report an error".'],
]

export function DemoVideo({ steps = true }: { steps?: boolean }) {
  return (
    <div className="stack demo">
      <video className="demovid" controls playsInline preload="none" poster={DEMO_POSTER} aria-describedby={steps ? 'demo-steps' : undefined}>
        <source src={DEMO_SRC} type="video/mp4" />
        Your browser cannot play this video. <a href={DEMO_SRC}>Download the tour (MP4)</a>.
      </video>
      <p className="muted" style={{ fontSize: '.8rem' }}>About 2½ minutes · narrated, with captions · turn your sound on · <a href={DEMO_SRC} download>Download</a></p>
      {steps && (
        <details>
          <summary>What the tour shows</summary>
          <ol id="demo-steps" className="demosteps">{DEMO_STEPS.map(([h, t]) => <li key={h}><b>{h}.</b> {t}</li>)}</ol>
        </details>
      )}
    </div>
  )
}
