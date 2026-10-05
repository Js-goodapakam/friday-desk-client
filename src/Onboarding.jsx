import { useState } from "react";
import fridayLogo from "./assets/Friday AI Logo.png";
import { INDUSTRIES, PLANS, getIndustry, featureLabel } from "./onboardingConfig";
import "./onboarding.css";

/* Small inline icon wrapper (same approach as Friday.jsx) */
const Ico = ({ children, className, fill = "none", sw = 1.8 }) => (
  <svg className={className} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const Arrow = () => (
  <Ico><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Ico>
);

const Check = ({ className }) => (
  <Ico className={className} sw={2.4}><path d="m5 12 5 5L20 7" /></Ico>
);

const INDUSTRY_ICONS = {
  bed: (
    <>
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M12 4v6" />
      <path d="M2 18h20" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6.5 6.5v11" />
      <path d="M17.5 6.5v11" />
      <path d="M3.5 9v6" />
      <path d="M20.5 9v6" />
      <path d="M6.5 12h11" />
    </>
  ),
};

const STEPS = [
  { id: "account", label: "Account" },
  { id: "industry", label: "Industry" },
  { id: "plan", label: "Plan" },
  { id: "setup", label: "Setup" },
];

function Stepper({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="ob-stepper" aria-label="Setup progress">
      {STEPS.map((step, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
        return (
          <li key={step.id} className={`ob-step ob-step--${state}`} aria-current={state === "current" ? "step" : undefined}>
            <span className="ob-step-dot">{state === "done" ? <Check /> : index + 1}</span>
            <span className="ob-step-label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function formatPrice(price, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Industry + Plan pages shown after signup / mobile verification.
 *
 * Props
 *  - initialStep:        "industry" | "plan"  (use "plan" to resume a customer who already chose an industry)
 *  - initialIndustry:    industry id already saved for this customer (or null)
 *  - onIndustrySelected: async (industryId) => void   - save it on your backend; throw an Error to show a message
 *  - onPlanSelected:     async ({ industry, plan }) => void - start checkout; throw an Error to show a message
 */
export default function FridayOnboarding({
  initialStep = "industry",
  initialIndustry = null,
  onIndustrySelected,
  onPlanSelected,
}) {
  const [step, setStep] = useState(initialIndustry ? initialStep : "industry");
  const [industry, setIndustry] = useState(initialIndustry);
  const [busy, setBusy] = useState(false);
  const [busyPlan, setBusyPlan] = useState(null);
  const [error, setError] = useState("");

  const selected = getIndustry(industry);
  const plans = PLANS[industry] || [];

  const continueToPlans = async () => {
    if (!industry) {
      setError("Choose an industry to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onIndustrySelected?.(industry);
      setStep("plan");
    } catch (err) {
      setError(err?.message || "Unable to save your industry. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const choosePlan = async (planId) => {
    setBusyPlan(planId);
    setError("");
    try {
      await onPlanSelected?.({ industry, plan: planId });
    } catch (err) {
      setError(err?.message || "Unable to start checkout. Please try again.");
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div className="ob-page">
      <header className="ob-top">
        <img className="ob-logo" src={fridayLogo} alt="Friday AI" />
      </header>

      <main className="ob-main">
        <Stepper current={step} />

        {/* ================= INDUSTRY ================= */}
        {step === "industry" && (
          <section className="ob-section" aria-labelledby="ob-industry-title">
            <h1 className="ob-title" id="ob-industry-title">What kind of business do you run?</h1>
            <p className="ob-subtitle">
              We&apos;ll set up Friday with the tools that fit your business.
            </p>

            <div className="ob-industries" role="radiogroup" aria-labelledby="ob-industry-title">
              {INDUSTRIES.map((item) => {
                const isSelected = industry === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`ob-industry${isSelected ? " is-selected" : ""}`}
                    onClick={() => { setIndustry(item.id); setError(""); }}
                  >
                    <span className="ob-industry-head">
                      <span className="ob-industry-icon"><Ico>{INDUSTRY_ICONS[item.icon]}</Ico></span>
                      <span className="ob-radio" aria-hidden="true">{isSelected && <Check />}</span>
                    </span>
                    <span className="ob-industry-title">{item.title}</span>
                    <span className="ob-industry-desc">{item.description}</span>
                    <span className="ob-industry-list">
                      {item.highlights.map((h) => (
                        <span key={h} className="ob-industry-item"><Check />{h}</span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="ob-note">
              Your industry decides which screens your workspace has. Once you continue, changing it needs a request to our support team.
            </p>

            {error && <div className="ob-error" role="alert">{error}</div>}

            <div className="ob-actions ob-actions--end">
              <button type="button" className="ob-btn ob-btn--primary" onClick={continueToPlans} disabled={busy || !industry}>
                {busy ? "Saving..." : <>Continue <Arrow /></>}
              </button>
            </div>
          </section>
        )}

        {/* ================= PLAN ================= */}
        {step === "plan" && selected && (
          <section className="ob-section" aria-labelledby="ob-plan-title">
            <h1 className="ob-title" id="ob-plan-title">Choose your plan</h1>
            <p className="ob-subtitle">
              Plans for {selected.title.toLowerCase()}.
              <button type="button" className="ob-link" onClick={() => { setStep("industry"); setError(""); }}>
                Change industry
              </button>
            </p>

            <div className="ob-plans">
              {plans.map((p, index) => {
                const previous = plans[index - 1];
                const listed = previous ? p.features.filter((f) => !previous.features.includes(f)) : p.features;
                return (
                  <article key={p.id} className={`ob-plan${p.recommended ? " is-recommended" : ""}`}>
                    {p.recommended && <span className="ob-badge">Recommended</span>}
                    <h2 className="ob-plan-name">{p.name}</h2>
                    <p className="ob-plan-tagline">{p.tagline}</p>

                    <div className="ob-price">
                      {p.price == null ? (
                        <span className="ob-price-empty">Contact us for pricing</span>
                      ) : (
                        <>
                          <span className="ob-price-amount">{formatPrice(p.price, p.currency)}</span>
                          <span className="ob-price-period">per {p.period}</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`ob-btn ${p.recommended ? "ob-btn--primary" : "ob-btn--secondary"}`}
                      onClick={() => choosePlan(p.id)}
                      disabled={busyPlan !== null}
                    >
                      {busyPlan === p.id ? "Please wait..." : `Choose ${p.name}`}
                    </button>

                    <div className="ob-plan-features">
                      <p className="ob-plan-includes">
                        {previous ? `Everything in ${previous.name}, plus` : "Includes"}
                      </p>
                      <ul>
                        {listed.map((f) => (
                          <li key={f}><Check />{featureLabel(industry, f)}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>

            {error && <div className="ob-error" role="alert">{error}</div>}

            <div className="ob-actions">
              <button type="button" className="ob-btn ob-btn--ghost" onClick={() => { setStep("industry"); setError(""); }}>
                <Ico><path d="m15 18-6-6 6-6" /></Ico>Back
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
