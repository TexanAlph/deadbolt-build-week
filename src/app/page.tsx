import Image from "next/image";

const pipeline = [
  {
    number: "01",
    verb: "MAP",
    title: "Threat-model the app",
    description:
      "Trace entry points, identity, sensitive data, and trust boundaries before judging risk.",
  },
  {
    number: "02",
    verb: "HUNT",
    title: "Reason across the code",
    description:
      "Four focused passes hunt secrets, auth flaws, injection, and dangerous configuration.",
  },
  {
    number: "03",
    verb: "PATCH",
    title: "Write the smallest fix",
    description:
      "Turn every confirmed finding into a focused, reviewable diff with the human stakes attached.",
  },
  {
    number: "04",
    verb: "RECHECK",
    title: "Re-analyze the patch",
    description:
      "Run the affected hunt lens again against the patched clone and show whether the original root cause remains.",
  },
];

const scanSteps = [
  {
    number: "01",
    title: "Add your source",
    detail: "Choose the application files you want Deadbolt to inspect.",
  },
  {
    number: "02",
    title: "Confirm authorization",
    detail: "Only audit code you own or are explicitly allowed to test.",
  },
  {
    number: "03",
    title: "Run the full loop",
    detail:
      "Use the API-backed engine to review evidence, focused patches, and affected-hunt re-analysis.",
  },
];

export default function Home() {
  return (
    <div className="site-shell home-shell">
      <header className="site-header home-header">
        <a className="brand" href="#top" aria-label="Deadbolt home">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span className="brand-name">DEADBOLT</span>
          <span className="brand-descriptor">AUTONOMOUS BLUE TEAM</span>
        </a>

        <nav className="home-nav" aria-label="Main navigation">
          <a href="#how">HOW IT WORKS</a>
          <a href="/analyze#scan">AUDIT YOUR SOURCE</a>
          <a
            href="https://github.com/TexanAlph/deadbolt-build-week"
            target="_blank"
            rel="noreferrer"
          >
            GITHUB ↗
          </a>
        </nav>

        <div className="header-status" aria-label="Build status">
          <span className="status-dot" aria-hidden="true" />
          <span>API-BACKED ENGINE</span>
        </div>
      </header>

      <main id="top">
        <section className="campaign-hero" aria-labelledby="campaign-heading">
          <h1 className="sr-only" id="campaign-heading">
            Deadbolt finds security bugs, patches them, and re-analyzes the
            patched code to confirm the fix
          </h1>

          <div className="campaign-frame">
            <Image
              className="campaign-art"
              src="/hero-vertical-axis.png"
              alt="A perfectly centered vertical flashlight beam illuminates a red security bug against a dark source-code graph."
              width={1738}
              height={905}
              sizes="(max-width: 720px) 100vw, 1400px"
              preload
            />
            <span className="frame-corner top-left" aria-hidden="true" />
            <span className="frame-corner top-right" aria-hidden="true" />
            <span className="frame-corner bottom-left" aria-hidden="true" />
            <span className="frame-corner bottom-right" aria-hidden="true" />
          </div>

          <div className="scan-command">
            <div className="scan-command-title">
              <p>START A DEFENSIVE AUDIT</p>
              <strong>Your repository</strong>
              <span>API-backed source analysis for code you own</span>
            </div>

            <div className="scan-command-metrics" aria-label="Audit capabilities">
              <span>
                <strong>4</strong> HUNT PASSES
              </span>
              <span>
                <strong>FOCUSED</strong> PATCH PLANS
              </span>
              <span>
                <strong>FRESH</strong> RE-ANALYSIS
              </span>
            </div>

            <a className="primary-action scan-now" href="/analyze#scan">
              Audit your source
              <span aria-hidden="true">↘</span>
            </a>
          </div>
        </section>

        <section className="home-story">
          <div className="home-story-title">
            <p className="eyebrow">THE MISSING SECURITY TEAM</p>
            <h2>
              Find the bug.
              <span>Fix the risk.</span>
              <em>Re-analyze it.</em>
            </h2>
          </div>

          <div className="home-story-copy">
            <p>
              Deadbolt gives solo builders the security loop enterprise teams
              already have: understand the application, find what matters,
              write the fix, and show whether the same hunt still finds it.
            </p>
            <div className="story-actions">
              <a className="text-action" href="/analyze#scan">
                Start a defensive audit <span aria-hidden="true">→</span>
              </a>
              <a className="text-action muted" href="#how">
                See how the loop works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="home-ownership">
              <span className="mini-lock" aria-hidden="true" />
              For repositories and deployments you own or are authorized to
              test.
            </p>
            <p className="home-ownership">
              The web product is the API-backed hunt → patch → re-analysis
              engine. The keyless <code>$deadbolt</code> Codex Skill is a
              separate read-only reasoning audit; it does not run this engine
              or claim patch verification.
            </p>
          </div>
        </section>

        <section className="builder-strip" aria-label="Who Deadbolt is for">
          <p>BUILT FOR THE DEVELOPER WITHOUT</p>
          <div>
            <span>A SECURITY TEAM</span>
            <span>CODEQL</span>
            <span>CI/CD</span>
            <span>TIME TO BECOME AN EXPERT</span>
          </div>
        </section>

        <section className="scan-guide" id="try">
          <div className="scan-guide-heading">
            <p className="eyebrow">API-BACKED ENGINE LOOP</p>
            <h2>
              Bring the code.
              <span>Deadbolt brings the security loop.</span>
            </h2>
          </div>

          <div className="scan-guide-grid">
            <div className="scan-steps">
              {scanSteps.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="evidence-preview">
              <div className="evidence-topline">
                <span>REPRESENTATIVE FINDING</span>
                <strong>CRITICAL</strong>
              </div>
              <p className="evidence-code">AUTH-008 · ACCESS CONTROL</p>
              <h3>
                One signed-in user can read another user&apos;s private record.
              </h3>
              <p>
                The route checks that a user exists, but never proves the
                requested record belongs to that user. Deadbolt follows the
                trust boundary across the route and data access—not just one
                line.
              </p>
              <div className="evidence-transition" aria-label="Fix result">
                <span>
                  <i aria-hidden="true" />
                  BEFORE · CROSS-TENANT READ
                </span>
                <b aria-hidden="true">→</b>
                <span className="fixed">
                  <i aria-hidden="true" />
                  AFTER · 404 DENIED
                </span>
              </div>
              <a className="primary-action" href="/analyze#scan">
                Audit your source
                <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
        </section>

        <section className="process-section" id="how">
          <div className="process-heading">
            <div>
              <p className="eyebrow">THE CORE LOOP</p>
              <h2>
                A finding is not finished until the patched clone is
                re-analyzed.
              </h2>
            </div>
            <p>
              Every result connects evidence, human impact, a focused patch,
              and a fresh run of the affected hunt lens.
            </p>
          </div>

          <div className="process-grid">
            {pipeline.map((item) => (
              <article key={item.number}>
                <div className="process-number">
                  <span>{item.number}</span>
                  <strong>{item.verb}</strong>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="process-signal" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-guardrail" id="guardrail">
          <div className="guardrail-symbol" aria-hidden="true">
            <span />
          </div>
          <div>
            <p className="eyebrow">THE SAFETY BOUNDARY</p>
            <h2>Defend what you own. Never weaponize what you find.</h2>
          </div>
          <p>
            Deadbolt reports evidence, plain-English impact, and patches. It
            does not probe third-party targets or produce turnkey attack tools.
          </p>
        </section>
      </main>

      <footer className="home-footer">
        <p>DEADBOLT · OPENAI BUILD WEEK 2026</p>
        <a href="/analyze#scan">AUDIT YOUR SOURCE ↘</a>
        <p>HUNT · PATCH · RE-ANALYZE</p>
      </footer>
    </div>
  );
}
