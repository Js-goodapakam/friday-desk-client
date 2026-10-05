import { useEffect, useState } from "react";
import fridayLogo from "./assets/Friday AI Logo.png";

/* Small inline icon wrapper (no extra packages needed) */
const Ico = ({ children, className, fill = "none", sw = 1.8 }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Arrow = () => (
  <Ico>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Ico>
);

/* Country codes for the mobile-verification step (India first / default) */
const COUNTRIES = [
  { code: "IN", dial: "+91", label: "India" },
  { code: "US", dial: "+1", label: "United States" },
  { code: "GB", dial: "+44", label: "United Kingdom" },
  { code: "AE", dial: "+971", label: "United Arab Emirates" },
  { code: "SA", dial: "+966", label: "Saudi Arabia" },
  { code: "SG", dial: "+65", label: "Singapore" },
  { code: "AU", dial: "+61", label: "Australia" },
  { code: "DE", dial: "+49", label: "Germany" },
];

export default function FridayLogin({ onLogin, onSignupVerified, onForgotPassword }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sendingReset, setSendingReset] = useState(false);
  const [countryDial, setCountryDial] = useState("+91");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const updateRightScale = () => {
      const panel = document.querySelector(".fl-right");
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      // 960 (not 984): a little empty canvas at the bottom may be cropped so the composition can be larger.
      const fitScale = Math.min(rect.width / 808, rect.height / 960, 1);

      // Keep the composition at its 100% physical size when browser zoom changes.
      // It may reduce to fit a smaller viewport, but it is never allowed to grow.
      const referenceDpr = 1;
      const dpr = window.devicePixelRatio || 1;
      // Largest size the composition may take at 100% zoom (1 = the 808x984 design size).
      const physicalScale = 1;
      const zoomCompensatedScale = physicalScale * referenceDpr / dpr;

      panel.style.setProperty(
        "--fl-right-scale",
        String(Math.min(fitScale, zoomCompensatedScale))
      );
    };

    updateRightScale();
    window.addEventListener("resize", updateRightScale);
    window.visualViewport?.addEventListener("resize", updateRightScale);

    return () => {
      window.removeEventListener("resize", updateRightScale);
      window.visualViewport?.removeEventListener("resize", updateRightScale);
    };
  }, []);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!businessName.trim()) {
      setFormError("Please enter your business name.");
      return;
    }

    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setFormError("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    // Details are valid - continue to mobile number verification.
    setMode("mobile");
    setFormError("");
    setSuccessMessage("");
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const digits = mobile.replace(/\D/g, "");
    if (!digits) {
      setFormError("Please enter your mobile number.");
      return;
    }

    const valid = countryDial === "+91"
      ? /^[6-9]\d{9}$/.test(digits)
      : digits.length >= 6 && digits.length <= 14;
    if (!valid) {
      setFormError(countryDial === "+91"
        ? "Please enter a valid 10-digit Indian mobile number."
        : "Please enter a valid mobile number.");
      return;
    }

    setSuccessMessage("Mobile number added.");
    onSignupVerified?.({
      businessName: businessName.trim(),
      email: email.trim(),
      password,
      mobile: `${countryDial}${digits}`,
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    onLogin?.("admin", email);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setFormError("Please enter your registered email address.");
      return;
    }

    setSendingReset(true);
    try {
      // Pass onForgotPassword={async (email) => { ...call your API... }} from the parent.
      // Throw an Error from it to show a message here.
      if (onForgotPassword) {
        await onForgotPassword(email.trim());
      } else {
        console.warn("FridayLogin: no onForgotPassword handler supplied - no reset email was sent.");
      }
      // Same wording whether or not the account exists (doesn't reveal registered emails).
      setSuccessMessage("If this email is registered, a password reset link is on its way. Please check your inbox.");
    } catch (error) {
      setFormError(error?.message || "Unable to send the reset link. Please try again.");
    } finally {
      setSendingReset(false);
    }
  };

  const switchToForgot = () => {
    setMode("forgot");
    setFormError("");
    setSuccessMessage("");
  };

  const switchToSignup = () => {
    setMode("signup");
    setFormError("");
    setSuccessMessage("");
  };

  const switchToLogin = () => {
    setMode("login");
    setFormError("");
    setSuccessMessage("");
  };

  return (
    <div className={`fl-page ${mode === "signup" ? "fl-signup-page" : "fl-login-page"}${mode === "forgot" ? " fl-forgot-page" : ""}${mode === "mobile" ? " fl-mobile-page" : ""}`}>
      <div className="fl-shell">
        {/* ================= LEFT ================= */}
        <section className="fl-left">
          <div className="fl-left-inner">
            <img className="fl-logo" src={fridayLogo} alt="Friday AI" />
            <div className="fl-tagline">
              <span>CRM</span><i /><span>Automation</span><i /><span>Communication</span>
            </div>

            {mode === "login" && <>
              <h1 className="fl-title">Login to your account</h1>
              <p className="fl-subtitle">Enter the details to access Friday AI workspace</p>

              <form className="fl-form" onSubmit={handleLoginSubmit}>
                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-email">Email</label>
                  <div className="fl-input">
                    <Ico className="fl-icon"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Ico>
                    <input id="fl-email" required type="email" placeholder="Enter your email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-password">Password</label>
                  <div className="fl-input">
                    <Ico className="fl-icon"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Ico>
                    <input id="fl-password" required type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="fl-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      <Ico>{showPassword ? <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></> : <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>}</Ico>
                    </button>
                  </div>
                </div>

                <div className="fl-row">
                  <label className="fl-remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
                  <button type="button" className="fl-forgot" onClick={switchToForgot}>Forgot password?</button>
                </div>

                {formError && <div className="fl-form-error">{formError}</div>}
                {successMessage && <div className="fl-form-success">{successMessage}</div>}

                <button type="submit" className="fl-submit">Sign in <Arrow /></button>
              </form>

              <div className="fl-divider">Or continue with</div>
              <div className="fl-social">
                <button type="button"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>Google</button>
                <button type="button"><svg viewBox="0 0 23 23" aria-hidden="true"><rect x="1" y="1" width="10" height="10" fill="#f25022" /><rect x="12" y="1" width="10" height="10" fill="#7fba00" /><rect x="1" y="12" width="10" height="10" fill="#00a4ef" /><rect x="12" y="12" width="10" height="10" fill="#ffb900" /></svg>Microsoft</button>
              </div>

              <p className="fl-signup">Don&apos;t have an account?<button type="button" onClick={switchToSignup}>Sign up</button></p>
            </>}

            {mode === "signup" && <>
              <h1 className="fl-title fl-signup-title">Create your account</h1>
              <p className="fl-subtitle">Add your details to get started</p>

              <form className="fl-form fl-signup-form" onSubmit={handleSignupSubmit}>
                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-business">Business Name</label>
                  <div className="fl-input"><Ico className="fl-icon"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" /></Ico><input id="fl-business" required type="text" placeholder="Enter your business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} autoComplete="organization" /></div>
                </div>

                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-signup-email">Email</label>
                  <div className="fl-input"><Ico className="fl-icon"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Ico><input id="fl-signup-email" required type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
                </div>

                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-signup-password">Password</label>
                  <div className="fl-input"><Ico className="fl-icon"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Ico><input id="fl-signup-password" required type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /><button type="button" className="fl-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}><Ico>{showPassword ? <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /> : <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>}</Ico></button></div>
                </div>

                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-confirm-password">Confirm Password</label>
                  <div className="fl-input"><Ico className="fl-icon"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Ico><input id="fl-confirm-password" required type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" /><button type="button" className="fl-eye" onClick={() => setShowConfirmPassword((v) => !v)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}><Ico>{showConfirmPassword ? <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /> : <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>}</Ico></button></div>
                </div>

                <label className="fl-terms"><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} /><span>I agree to the <a href="https://js-goodapakam.github.io/project-friday/terms-and-conditions" target="_blank" rel="noreferrer">Terms</a> and <a href="https://js-goodapakam.github.io/project-friday/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>

                {formError && <div className="fl-form-error">{formError}</div>}

                <button type="submit" className="fl-submit" ><>Create Account <Arrow /></></button>
              </form>

              <div className="fl-divider fl-signup-divider">Or Sign in with</div>
              <div className="fl-social fl-signup-social">
                <button type="button">
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Google
                </button>
                <button type="button">
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
    <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
    <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
    <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
  </svg>
  Microsoft
</button>
              </div>

              <p className="fl-signup">Already have an account?<button type="button" onClick={switchToLogin}>Sign in</button></p>
            </>}

            {mode === "mobile" && <>
              <h1 className="fl-title fl-mobile-title">Mobile Number Verification</h1>
              <p className="fl-subtitle">Enter your phone number to receive a verification code</p>

              <form className="fl-form fl-mobile-form" onSubmit={handleMobileSubmit}>
                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-mobile">Mobile Number</label>
                  <div className="fl-input fl-phone-input">
                    <select className="fl-country" aria-label="Country code" value={countryDial} onChange={(e) => setCountryDial(e.target.value)}>
                      {COUNTRIES.map((c) => <option key={c.code} value={c.dial}>{c.code} {c.dial}</option>)}
                    </select>
                    <input id="fl-mobile" required autoFocus type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} placeholder="Enter your phone number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} />
                  </div>
                </div>

                {formError && <div className="fl-form-error" role="alert">{formError}</div>}
                {successMessage && <div className="fl-form-success" role="status">{successMessage}</div>}

                <button type="submit" className="fl-submit">Next <Arrow /></button>
              </form>

              <p className="fl-signup">Already have an account?<button type="button" onClick={switchToLogin}>Sign in</button></p>
            </>}

            {mode === "forgot" && <>
              <h1 className="fl-title fl-forgot-title">Forgot Password</h1>
              <p className="fl-subtitle">Enter your registered email address, and we&apos;ll send you a link to reset your password.</p>

              <form className="fl-form fl-forgot-form" onSubmit={handleForgotSubmit}>
                <div className="fl-field">
                  <label className="fl-label" htmlFor="fl-forgot-email">Email</label>
                  <div className="fl-input">
                    <Ico className="fl-icon"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Ico>
                    <input id="fl-forgot-email" required autoFocus type="email" placeholder="Enter your registered email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {formError && <div className="fl-form-error" role="alert">{formError}</div>}
                {successMessage && <div className="fl-form-success" role="status">{successMessage}</div>}

                <button type="submit" className="fl-submit" disabled={sendingReset}>{sendingReset ? "Sending..." : <>Send Reset Link <Arrow /></>}</button>
              </form>

              <button type="button" className="fl-back-link" onClick={switchToLogin}>
                <Ico><path d="m15 18-6-6 6-6" /></Ico>Back
              </button>
            </>}

          </div>

          <footer className="fl-footer">
            <span>© 2026 Friday Innovations Private Limited. All rights reserved.</span>
            <nav><a href="https://js-goodapakam.github.io/project-friday/privacy-policy" target="_blank" rel="noreferrer">Privacy</a><a href="https://js-goodapakam.github.io/project-friday/terms-and-conditions" target="_blank" rel="noreferrer">Terms</a></nav>
          </footer>
        </section>

        {/* ================= RIGHT ================= */}
        <section className="fl-right">
          <div className="fl-right-canvas">
          <svg className="fl-orbits" viewBox="0 0 808 984" preserveAspectRatio="none" aria-hidden="true">
            <path d="M214 700 C230 600 320 520 430 480" />
            <path d="M245 725 C400 770 620 760 720 690" />
            <path d="M610 190 C660 150 720 120 790 100" />
          </svg>

          <div className="fl-topnav">
            <span>Build</span><i />
            <span>Automate</span><i />
            <span>Grow</span>
          </div>

          <div className="fl-hero">
            <h2>
              <span>Your business.</span>
              <span className="fl-grad">Smarter with</span>
              <span className="fl-grad">Friday AI.</span>
            </h2>
            <p>
              AI-powered CRM, automation and communication built for modern businesses.
            </p>
          </div>

          <div className="fl-cluster">
            <div className="fl-orb" />

            {/* AI Assistant */}
            <div className="fl-card fl-card--ai">
              <div className="fl-ai-head">
                <Ico fill="currentColor" sw={0}>
                  <path d="M12 2l2.2 6.3L21 10l-6.8 1.7L12 18l-2.2-6.3L3 10l6.8-1.7z" />
                </Ico>
                <span className="fl-ai-pill">AI Assistant</span>
                <span className="fl-ai-dot" />
              </div>
              <p>Turning conversations into opportunities</p>
              <span className="fl-arrow"><Arrow /></span>
            </div>

            {/* CRM */}
            <div className="fl-card fl-card--light fl-card--crm">
              <div className="fl-card-top">
                <Ico className="fl-card-ico" fill="currentColor" sw={0}>
                  <circle cx="9" cy="7" r="4" />
                  <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2z" />
                  <circle cx="17.5" cy="8" r="3" />
                  <path d="M18 14a4.5 4.5 0 0 1 4 4.5V21h-4v-2.5a6 6 0 0 0-1.4-3.9A4.4 4.4 0 0 1 18 14z" />
                </Ico>
                <span className="fl-arrow"><Arrow /></span>
              </div>
              <div>
                <h4>CRM</h4>
                <small>Manage customers<br />smarter</small>
              </div>
            </div>

            {/* Automation */}
            <div className="fl-card fl-card--light fl-card--auto">
              <Ico className="fl-card-ico" fill="currentColor" sw={0}>
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </Ico>
              <div className="fl-card-bottom">
                <div>
                  <h4>Automation</h4>
                  <small>Save time,<br />do more</small>
                </div>
                <span className="fl-arrow"><Arrow /></span>
              </div>
            </div>

            {/* Communication */}
            <div className="fl-card fl-card--light fl-card--comm">
              <Ico className="fl-card-ico" fill="currentColor" sw={0}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </Ico>
              <h4>Communication</h4>
              <span className="fl-mini">
                <Ico><path d="M17 7 7 17" /><path d="M7 17h8" /><path d="M7 17V9" /></Ico>
              </span>
              <small>Calls, SMS &amp; more<br />in one place</small>
              <span className="fl-arrow"><Arrow /></span>
            </div>
          </div>

          <div className="fl-stats">
            <div className="fl-stat">
              <Ico>
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </Ico>
              <span>Trusted by<br />Businesses</span>
            </div>
            <div className="fl-stat">
              <Ico><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></Ico>
              <span>99.9%<br />Uptime</span>
            </div>
            <div className="fl-stat">
              <Ico>
                <rect x="3" y="14" width="4" height="7" rx="1" />
                <rect x="10" y="9" width="4" height="12" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
              </Ico>
              <span>Scale<br />Effortlessly</span>
            </div>
            <div className="fl-stat">
              <Ico>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </Ico>
              <span>Built for<br />a Global World</span>
            </div>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
