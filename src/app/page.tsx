export default function Home() {
  const pipeline = [
    {
      number: "01",
      label: "Map",
      title: "Threat-model the app",
      description:
        "Trace entry points, authentication, sensitive data, and trust boundaries before judging risk.",
    },
    {
      number: "02",
      label: "Hunt",
      title: "Reason across the code",
      description:
        "Find logic flaws and dangerous paths that pattern-matching scanners routinely miss.",
    },
    {
      number: "03",
      label: "Repair",
      title: "Write the patch",
      description:
        "Turn every confirmed finding into a focused, reviewable diff with the human stakes attached.",
    },
    {
      number: "04",
      label: "Verify",
      title: "Re-test to green",
      description:
        "Run the evidence back through the same checks and prove the risk actually changed.",
    },
  ];

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Deadbolt home">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span className="brand-name">DEADBOLT</span>
          <span className="working-name">WORKING NAME</span>
        </a>

        <div className="header-status" aria-label="Build status">
          <span className="status-dot" aria-hidden="true" />
          <span>M0 · FOUNDATION ONLINE</span>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">AUTONOMOUS BLUE-TEAM SECURITY</p>
            <h1>
              Ship fast.
              <span>Leave nothing unlocked.</span>
            </h1>
            <p className="hero-lede">
              Deadbolt gives solo builders the security loop enterprise teams
              already have: understand the app, find what matters, write the
              fix, and prove it worked.
            </p>

            <div className="hero-actions">
              <a className="primary-action" href="#pipeline">
                See the mission
                <span aria-hidden="true">↘</span>
              </a>
              <a className="text-action" href="#guardrail">
                Read the safety boundary
              </a>
            </div>

            <div className="ownership-note">
              <span className="mini-lock" aria-hidden="true" />
              <p>
                <strong>Built for your own code.</strong> Deadbolt audits only
                repositories and deployments you own or are authorized to test.
              </p>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Deadbolt audit pipeline preview"
          >
            <div className="visual-topline">
              <div>
                <p className="micro-label">AUDIT RUN</p>
                <p className="run-id">DB—0001</p>
              </div>
              <span className="queued-badge">AWAITING REPOSITORY</span>
            </div>

            <div className="scan-field" aria-hidden="true">
              <div className="radar-ring ring-one" />
              <div className="radar-ring ring-two" />
              <div className="radar-cross horizontal" />
              <div className="radar-cross vertical" />
              <div className="scan-beam" />
              <div className="target-core">
                <span className="target-bolt">D</span>
              </div>
              <span className="coordinate coord-one">AUTH</span>
              <span className="coordinate coord-two">DATA</span>
              <span className="coordinate coord-three">INPUT</span>
              <span className="coordinate coord-four">CONFIG</span>
            </div>

            <div className="visual-footer">
              <div className="stage">
                <span>01</span>
                <p>MAP</p>
              </div>
              <div className="stage">
                <span>02</span>
                <p>HUNT</p>
              </div>
              <div className="stage">
                <span>03</span>
                <p>PATCH</p>
              </div>
              <div className="stage">
                <span>04</span>
                <p>RE-TEST</p>
              </div>
            </div>
          </div>
        </section>

        <section className="positioning" aria-label="Who Deadbolt is for">
          <p>FOR THE BUILDER WITHOUT</p>
          <div className="positioning-list">
            <span>A SECURITY TEAM</span>
            <span>CODEQL</span>
            <span>CI/CD</span>
            <span>TIME TO BECOME AN EXPERT</span>
          </div>
        </section>

        <section className="pipeline-section" id="pipeline">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE CORE LOOP</p>
              <h2>A finding is not finished until the fix turns green.</h2>
            </div>
            <p className="section-note">
              M0 establishes the product foundation. The working analysis
              pipeline arrives milestone by milestone from here.
            </p>
          </div>

          <div className="pipeline-grid">
            {pipeline.map((item) => (
              <article className="pipeline-card" key={item.number}>
                <div className="card-meta">
                  <span>{item.number}</span>
                  <span>{item.label}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="card-line" aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="guardrail" id="guardrail">
          <div className="guardrail-mark" aria-hidden="true">
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

      <footer>
        <p>DEADBOLT · OPENAI BUILD WEEK 2026</p>
        <p>FOUNDATION COMMIT · JUL 17</p>
      </footer>
    </div>
  );
}
