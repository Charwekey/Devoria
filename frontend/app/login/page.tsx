"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. SPLIT LAYOUT: Full-viewport two-column layout — left panel is a
 *    branded illustration/copy side, right panel holds the form.
 *    On mobile it collapses to a single centered card.
 *
 * 2. TYPOGRAPHY: DM Sans + Instrument Serif pairing (brand-consistent
 *    with all other dashboard views). Product name in serif italic on
 *    the left panel.
 *
 * 3. LOGO MARK: Replaced plain icon circle with a proper logo tile that
 *    has a gradient background and clean proportions.
 *
 * 4. FORM INPUTS: Focus rings match brand blue. Labels use uppercase
 *    tracking. Password toggle button is properly sized and visible.
 *
 * 5. SUBMIT BUTTON: Full-width with loading state. Hover deepens color.
 *    Disabled state reduces opacity gracefully.
 *
 * 6. LEFT PANEL: Decorative radial gradient mesh, a testimonial/feature
 *    quote, and three feature bullet points give the auth page substance.
 *    This is common in polished SaaS products (Linear, Vercel, etc.).
 *
 * 7. ANIMATIONS: Card fades + slides up on mount. Input focus transitions.
 *    Subtle hover on the "Forgot password" link.
 *
 * 8. RESPONSIVENESS: Left panel hidden below 900px. Form card fills
 *    screen on mobile with comfortable padding.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --lg-blue-50:  #eff6ff;
      --lg-blue-100: #dbeafe;
      --lg-blue-500: #3b82f6;
      --lg-blue-600: #2563eb;
      --lg-blue-700: #1d4ed8;
      --lg-blue-800: #1e40af;
      --lg-gray-100: #f3f4f6;
      --lg-gray-200: #e5e7eb;
      --lg-gray-400: #9ca3af;
      --lg-gray-500: #6b7280;
      --lg-gray-700: #374151;
      --lg-gray-900: #111827;
      --lg-font:  'DM Sans', sans-serif;
      --lg-serif: 'Instrument Serif', serif;
      --lg-r-md: 12px; --lg-r-lg: 16px; --lg-r-xl: 20px;
      --lg-shadow-sm: 0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --lg-shadow-lg: 0 20px 60px rgba(0,0,0,.12), 0 6px 16px rgba(0,0,0,.07);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--lg-font); color: var(--lg-gray-900); -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .lg-page { min-height: 100vh; display: flex; flex-direction: column; background: #f8fafc; }
    .lg-main { flex: 1; display: flex; align-items: stretch; }

    /* ── Split layout ── */
    .lg-split { display: flex; width: 100%; min-height: calc(100vh - 130px); }

    /* ── Left brand panel ── */
    .lg-left {
      flex: 1;
      background:
        radial-gradient(ellipse 90% 70% at 20% 20%, rgba(59,130,246,.18) 0%, transparent 55%),
        radial-gradient(ellipse 60% 60% at 85% 80%, rgba(29,78,216,.14) 0%, transparent 50%),
        linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #2563eb 100%);
      padding: 4rem 3.5rem;
      display: flex; flex-direction: column; justify-content: center; gap: 3rem;
      position: relative; overflow: hidden;
    }
    /* Subtle geometric decoration */
    .lg-left::before {
      content: '';
      position: absolute; top: -80px; right: -80px;
      width: 320px; height: 320px;
      border-radius: 50%;
      border: 60px solid rgba(255,255,255,.05);
      pointer-events: none;
    }
    .lg-left::after {
      content: '';
      position: absolute; bottom: -60px; left: -60px;
      width: 240px; height: 240px;
      border-radius: 50%;
      border: 50px solid rgba(255,255,255,.04);
      pointer-events: none;
    }

    .lg-brand-logo {
      display: flex; align-items: center; gap: .875rem; position: relative; z-index: 1;
    }
    .lg-brand-icon {
      width: 46px; height: 46px; border-radius: 12px;
      background: rgba(255,255,255,.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .lg-brand-name {
      font-family: var(--lg-serif);
      font-size: 1.5rem; font-weight: 400; font-style: italic;
      color: white; letter-spacing: -.01em;
    }

    .lg-left-copy { position: relative; z-index: 1; }
    .lg-left-headline {
      font-family: var(--lg-serif);
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 400; color: white; line-height: 1.25;
      letter-spacing: -.02em; margin-bottom: 1rem;
    }
    .lg-left-headline em { font-style: italic; opacity: .85; }
    .lg-left-sub {
      font-size: .9rem; color: rgba(255,255,255,.65);
      line-height: 1.65; max-width: 360px;
    }

    .lg-features { display: flex; flex-direction: column; gap: .875rem; position: relative; z-index: 1; }
    .lg-feature {
      display: flex; align-items: flex-start; gap: .75rem;
    }
    .lg-feature-check {
      width: 20px; height: 20px; border-radius: 50%;
      background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
    }
    .lg-feature-text { font-size: .85rem; color: rgba(255,255,255,.75); line-height: 1.5; }

    .lg-testimonial {
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: var(--lg-r-lg); padding: 1.4rem 1.5rem;
      position: relative; z-index: 1;
    }
    .lg-testimonial-quote {
      font-size: .875rem; color: rgba(255,255,255,.8);
      line-height: 1.6; margin-bottom: .875rem; font-style: italic;
    }
    .lg-testimonial-author {
      font-size: .75rem; font-weight: 700; color: rgba(255,255,255,.5);
      letter-spacing: .06em; text-transform: uppercase;
    }

    /* ── Right form panel ── */
    .lg-right {
      width: 700px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      padding: 3rem 2rem;
      background: #f8fafc;
    }
    .lg-form-card {
      width: 100%; max-width: 400px;
      background: white; border-radius: var(--lg-r-xl);
      padding: 2.5rem 2rem;
      box-shadow: var(--lg-shadow-lg);
      border: 1px solid var(--lg-gray-200);
      animation: lg-rise .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes lg-rise {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Form header */
    .lg-form-icon-wrap {
      width: 52px; height: 52px; border-radius: 14px;
      background: var(--lg-blue-50); color: var(--lg-blue-600);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
    }
    .lg-form-title {
      font-size: 1.5rem; font-weight: 800;
      color: var(--lg-gray-900); letter-spacing: -.02em;
      margin-bottom: .35rem;
    }
    .lg-form-sub { font-size: .875rem; color: var(--lg-gray-500); margin-bottom: 2rem; }

    /* Inputs */
    .lg-field { margin-bottom: 1.1rem; }
    .lg-field-top {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: .45rem;
    }
    .lg-label {
      font-size: .68rem; font-weight: 800;
      letter-spacing: .09em; text-transform: uppercase; color: var(--lg-gray-500);
    }
    .lg-forgot {
      font-size: .75rem; font-weight: 700; color: var(--lg-blue-600);
      text-decoration: none; transition: color .15s;
    }
    .lg-forgot:hover { color: var(--lg-blue-700); }

    .lg-input-wrap { position: relative; }
    .lg-input {
      width: 100%; padding: 10px 14px;
      border: 1.5px solid var(--lg-gray-200); border-radius: var(--lg-r-md);
      font-family: var(--lg-font); font-size: .9rem; font-weight: 500;
      color: var(--lg-gray-900); background: white; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .lg-input::placeholder { color: var(--lg-gray-400); font-weight: 400; }
    .lg-input:focus {
      border-color: var(--lg-blue-500);
      box-shadow: 0 0 0 3px rgba(59,130,246,.13);
    }
    .lg-input.has-toggle { padding-right: 44px; }

    .lg-toggle-btn {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--lg-gray-400); display: flex; align-items: center;
      transition: color .15s; padding: 2px;
    }
    .lg-toggle-btn:hover { color: var(--lg-gray-700); }

    /* Submit */
    .lg-submit {
      width: 100%; padding: 11px;
      background: var(--lg-blue-600); color: white;
      border: none; border-radius: var(--lg-r-md);
      font-family: var(--lg-font); font-size: .95rem; font-weight: 700;
      cursor: pointer; margin-top: 1.5rem;
      transition: background .15s, box-shadow .15s, opacity .15s;
      box-shadow: 0 1px 3px rgba(37,99,235,.28);
    }
    .lg-submit:hover:not(:disabled) {
      background: var(--lg-blue-700);
      box-shadow: 0 4px 12px rgba(37,99,235,.35);
    }
    .lg-submit:disabled { opacity: .55; cursor: not-allowed; }

    /* Footer link */
    .lg-register-link {
      text-align: center; margin-top: 1.5rem;
      font-size: .82rem; color: var(--lg-gray-500);
    }
    .lg-register-link a {
      color: var(--lg-blue-600); font-weight: 700; text-decoration: none;
      transition: color .15s;
    }
    .lg-register-link a:hover { color: var(--lg-blue-700); }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .lg-left  { display: none; }
      .lg-right { width: 100%; background: white; padding: 2rem 1rem; }
      .lg-form-card { box-shadow: none; border: none; padding: 2rem 1rem; }
    }
    @media (max-width: 480px) {
      .lg-form-card { padding: 1.5rem 1rem; }
    }
  `}</style>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  /* Redirect if already logged in — logic unchanged */
  useEffect(() => {
    if (!loading && user) {
      if (user.is_admin) router.push("/dashboard/admin");
      else if (user.role === "instructor") router.push("/dashboard/instructor");
      else if (user.role === "assistant") router.push("/dashboard/assistant");
      else router.push("/dashboard/student");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email.toLowerCase().trim());
      formData.append("password", password);
      const res = await api.post("/users/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      toast.success("Successfully logged in!");
      login(res.data.access_token, res.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid email or password.");
      setLoginLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <>
      <GlobalStyles />
      <Navbar />

      <main className="lg-main">
        <div className="lg-split">

          {/* ── Left brand panel ── */}
          <div className="lg-left">
            {/* Logo */}
            <div className="lg-brand-logo">
              <div className="lg-brand-icon">
                <GraduationCap size={22} />
              </div>
              <span className="lg-brand-name">Devoria</span>
            </div>

            {/* Headline copy */}
            <div className="lg-left-copy">
              <h2 className="lg-left-headline">
                Build skills that<br /><em>actually matter.</em>
              </h2>
              <p className="lg-left-sub">
                A structured curriculum environment designed to take you from zero to production-ready engineer — in just 8 weeks.
              </p>
            </div>

            {/* Feature list */}
            <div className="lg-features">
              {[
                "Live instructor-led sessions, Mon / Wed / Fri",
                "Real project submissions with grade tracking",
                "Portfolio showcase for final projects",
              ].map((feat) => (
                <div key={feat} className="lg-feature">
                  <div className="lg-feature-check">
                    <CheckCircle size={12} color="white" />
                  </div>
                  <p className="lg-feature-text">{feat}</p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="lg-testimonial">
              <p className="lg-testimonial-quote">
                "The curriculum structure and instructor feedback pushed me further than any self-paced course ever did."
              </p>
              <p className="lg-testimonial-author">— Kwame A., Cohort 3 Graduate</p>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="lg-right">
            <div className="lg-form-card">

              {/* Form icon */}
              <div className="lg-form-icon-wrap">
                <GraduationCap size={24} />
              </div>

              <h2 className="lg-form-title">Welcome back</h2>
              <p className="lg-form-sub">Sign in to continue to Devoria</p>

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="lg-field">
                  <div className="lg-field-top">
                    <label className="lg-label">Email Address</label>
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="lg-input"
                  />
                </div>

                {/* Password */}
                <div className="lg-field">
                  <div className="lg-field-top">
                    <label className="lg-label">Password</label>
                    <a href="#" className="lg-forgot">Forgot password?</a>
                  </div>
                  <div className="lg-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="lg-input has-toggle"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="lg-toggle-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loginLoading} className="lg-submit">
                  {loginLoading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <p className="lg-register-link">
                Don't have an account?{" "}
                <Link href="/register">Apply for the program</Link>
              </p>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}