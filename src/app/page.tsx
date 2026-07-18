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
    verb: "PROVE",
    title: "Re-test to green",
    description:
      "Re-run the original security invariant and show exactly what changed from red to green.",
  },
];

const scanSteps = [
  {
    number: "01",
    title: "Open the scanner",
    detail: "InvoicePilot is already selected and ready.",
  },
  {
    number: "02",
    title: "Confirm authorization",
    detail: "The sample is synthetic and owned by this project.",
  },
  {
    number: "03",
    title: "Run the full loop",
    detail: "Review 8 findings, 8 patches, and 8 green re-tests.",
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
          <a href="/demo">COMPLETED REPORT</a>
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
          <span>8/8 VERIFIED</span>
        </div>
      </header>

      <main id="top">
        <section className="campaign-hero" aria-labelledby="campaign-heading">
          <h1 className="sr-only" id="campaign-heading">
            Deadbolt finds security bugs, patches them, and proves the fix
          </h1>

          <div className="campaign-frame">
            <Image
              className="campaign-art"
              src="/og.png"
              alt="A focused beam reveals a security bug in source code, then points to a verified green shield."
              width={1200}
              height={630}
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
              <p>READY-TO-SCAN SAMPLE</p>
              <strong>InvoicePilot</strong>
              <span>Synthetic invoice SaaS with known ground truth</span>
            </div>

            <div className="scan-command-metrics" aria-label="Sample details">
              <span>
                <strong>19</strong> SOURCE FILES
              </span>
              <span>
                <strong>8</strong> PLANTED RISKS
              </span>
              <span>
                <strong>~20s</strong> TO RUN
              </span>
            </div>

            <a className="primary-action scan-now" href="/analyze#scan">
              Scan InvoicePilot now
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
              <em>Prove it.</em>
            </h2>
          </div>

          <div className="home-story-copy">
            <p>
              Deadbolt gives solo builders the security loop enterprise teams
              already have: understand the application, find what matters,
              write the fix, and prove it worked.
            </p>
            <div className="story-actions">
              <a className="text-action" href="/demo">
                View the completed report <span aria-hidden="true">→</span>
              </a>
              <a className="text-action muted" href="/analyze#scan">
                Audit my source <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="home-ownership">
              <span className="mini-lock" aria-hidden="true" />
              For repositories and deployments you own or are authorized to
              test.
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
            <p className="eyebrow">TRY THE REAL LOOP</p>
            <h2>
              Don&apos;t watch a mockup.
              <span>Scan the vulnerable app yourself.</span>
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
              <p className="evidence-code">IP-008 · AUTH / IDOR</p>
              <h3>
                One signed-in customer can read another customer&apos;s
                invoice.
              </h3>
              <p>
                The route checks that a user exists, but never proves the
                invoice belongs to that user. Deadbolt follows the trust
                boundary across the route and data access—not just one line.
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
                Run this hunt
                <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
        </section>

        <section className="process-section" id="how">
          <div className="process-heading">
            <div>
              <p className="eyebrow">THE CORE LOOP</p>
              <h2>A finding is not finished until the fix turns green.</h2>
            </div>
            <p>
              Every result connects evidence, human impact, a focused patch,
              and a finding-specific regression check.
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
        <a href="/analyze#scan">SCAN INVOICEPILOT ↘</a>
        <p>FULL LOOP LIVE · 8/8 GREEN</p>
      </footer>
    </div>
  );
}
