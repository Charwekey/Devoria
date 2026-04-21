"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. SPLIT LAYOUT: Mirrors the Login page — branded left panel with
 *    steps/features, clean right form panel. Creates a cohesive auth
 *    flow so Register and Login feel like the same product.
 *
 * 2. LEFT PANEL: Shows "3 steps to get started" process with numbered
 *    step circles. Same blue gradient mesh background as Login.
 *
 * 3. FORM CARD: Slides up on mount. Icon tile, title, subtitle match
 *    Login proportions exactly. Form inputs share the same focus-ring
 *    and label system.
 *
 * 4. TRACK SELECTOR: Replaced a plain <select> with styled pill-toggle
 *    buttons (Frontend / Backend / Fullstack) that are more intuitive
 *    and visually engaging. The select value is still updated normally.
 *
 * 5. ROLE SELECTOR: Styled as two card-style radio buttons so the
 *    choice is immediately clear (Student vs Instructor).
 *
 * 6. GRID LAYOUT: Name row uses a proper 2-column CSS grid. Collapses
 *    to 1 column on mobile.
 *
 * 7. PASSWORD TOGGLE: Same Eye/EyeOff pattern from Login, properly
 *    sized and with hover state.
 *
 * 8. SUBMIT BUTTON: Full-width primary blue with loading state and
 *    deep-hover. Disabled opacity on loading.
 *
 * 9. TYPOGRAPHY: DM Sans + Instrument Serif throughout for brand
 *    consistency with all other pages.
 *
 * 10. RESPONSIVENESS: Left panel hides < 900px. Form fills screen on
 *     mobile with appropriate padding reduction.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --rg-blue-50:  #eff6ff;
      --rg-blue-100: #dbeafe;
      --rg-blue-200: #bfdbfe;
      --rg-blue-500: #3b82f6;
      --rg-blue-600: #2563eb;
      --rg-blue-700: #1d4ed8;
      --rg-blue-800: #1e40af;
      --rg-gray-100: #f3f4f6;
      --rg-gray-200: #e5e7eb;
      --rg-gray-300: #d1d5db;
      --rg-gray-400: #9ca3af;
      --rg-gray-500: #6b7280;
      --rg-gray-700: #374151;
      --rg-gray-900: #111827;
      --rg-font:  'DM Sans', sans-serif;
      --rg-serif: 'Instrument Serif', serif;
      --rg-r-md: 12px; --rg-r-lg: 16px; --rg-r-xl: 20px;
      --rg-shadow-lg: 0 20px 60px rgba(0,0,0,.11), 0 6px 16px rgba(0,0,0,.06);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--rg-font); color: var(--rg-gray-900); -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .rg-page { min-height: 100vh; display: flex; flex-direction: column; background: #f8fafc; }
    .rg-main { flex: 1; display: flex; align-items: stretch; }
    .rg-split { display: flex; width: 100%; min-height: calc(100vh - 130px); }

    /* ── Left panel (same gradient system as login) ── */
    .rg-left {
      flex: 1;
      background:
        radial-gradient(ellipse 90% 70% at 20% 20%, rgba(59,130,246,.18) 0%, transparent 55%),
        radial-gradient(ellipse 60% 60% at 85% 80%, rgba(29,78,216,.14) 0%, transparent 50%),
        linear-gradient(160deg, #1e3a8a 0%, #1e40af 40%, #2563eb 100%);
      padding: 4rem 3.5rem;
      display: flex; flex-direction: column; justify-content: center; gap: 3rem;
      position: relative; overflow: hidden;
    }
    .rg-left::before {
      content: '';
      position: absolute; top: -80px; right: -80px;
      width: 320px; height: 320px; border-radius: 50%;
      border: 60px solid rgba(255,255,255,.05); pointer-events: none;
    }
    .rg-left::after {
      content: '';
      position: absolute; bottom: -60px; left: -60px;
      width: 240px; height: 240px; border-radius: 50%;
      border: 50px solid rgba(255,255,255,.04); pointer-events: none;
    }

    /* Brand mark */
    .rg-brand { display: flex; align-items: center; gap: .875rem; position: relative; z-index: 1; }
    .rg-brand-icon {
      width: 46px; height: 46px; border-radius: 12px;
      background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .rg-brand-name {
      font-family: var(--rg-serif); font-size: 1.5rem;
      font-weight: 400; font-style: italic; color: white;
    }

    /* Left copy */
    .rg-left-copy { position: relative; z-index: 1; }
    .rg-left-headline {
      font-family: var(--rg-serif);
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 400; color: white; line-height: 1.25;
      letter-spacing: -.02em; margin-bottom: 1rem;
    }
    .rg-left-headline em { font-style: italic; opacity: .85; }
    .rg-left-sub {
      font-size: .88rem; color: rgba(255,255,255,.6);
      line-height: 1.65; max-width: 360px;
    }

    /* Steps list */
    .rg-steps { display: flex; flex-direction: column; gap: 1.1rem; position: relative; z-index: 1; }
    .rg-step { display: flex; align-items: flex-start; gap: .875rem; }
    .rg-step-num {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
      display: flex; align-items: center; justify-content: center;
      font-size: .72rem; font-weight: 800; color: white; margin-top: 1px;
    }
    .rg-step-text { font-size: .855rem; color: rgba(255,255,255,.72); line-height: 1.5; }
    .rg-step-text strong { color: white; font-weight: 700; }

    /* Quote card */
    .rg-quote {
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
      border-radius: var(--rg-r-lg); padding: 1.4rem 1.5rem; position: relative; z-index: 1;
    }
    .rg-quote-text {
      font-size: .875rem; color: rgba(255,255,255,.78);
      line-height: 1.6; font-style: italic; margin-bottom: .875rem;
    }
    .rg-quote-author {
      font-size: .72rem; font-weight: 800; color: rgba(255,255,255,.45);
      letter-spacing: .07em; text-transform: uppercase;
    }

    /* ── Right panel ── */
    .rg-right {
      width: 700px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      padding: 2.5rem 2rem; background: #f8fafc;
    }
    .rg-form-card {
      width: 100%; max-width: 430px;
      background: white; border-radius: var(--rg-r-xl);
      padding: 2.25rem 2rem;
      box-shadow: var(--rg-shadow-lg);
      border: 1px solid var(--rg-gray-200);
      animation: rg-rise .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes rg-rise {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Form header */
    .rg-form-icon {
      width: 48px; height: 48px; border-radius: 13px;
      background: var(--rg-blue-50); color: var(--rg-blue-600);
      display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
    }
    .rg-form-title { font-size: 1.4rem; font-weight: 800; letter-spacing: -.02em; color: var(--rg-gray-900); margin-bottom: .3rem; }
    .rg-form-sub   { font-size: .85rem; color: var(--rg-gray-500); margin-bottom: 1.75rem; }

    /* Fields */
    .rg-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .rg-field { margin-bottom: .875rem; }
    .rg-label {
      display: block; font-size: .67rem; font-weight: 800;
      letter-spacing: .09em; text-transform: uppercase;
      color: var(--rg-gray-500); margin-bottom: .4rem;
    }
    .rg-input, .rg-select {
      width: 100%; padding: 9px 13px;
      border: 1.5px solid var(--rg-gray-200); border-radius: var(--rg-r-md);
      font-family: var(--rg-font); font-size: .875rem; font-weight: 500;
      color: var(--rg-gray-900); background: white; outline: none;
      transition: border-color .15s, box-shadow .15s;
      -webkit-appearance: none; appearance: none;
    }
    .rg-input::placeholder { color: var(--rg-gray-400); font-weight: 400; }
    .rg-input:focus, .rg-select:focus {
      border-color: var(--rg-blue-500);
      box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    }
    .rg-input.has-toggle { padding-right: 42px; }

    /* Password toggle */
    .rg-pw-wrap { position: relative; }
    .rg-pw-toggle {
      position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--rg-gray-400); display: flex; align-items: center;
      transition: color .15s; padding: 2px;
    }
    .rg-pw-toggle:hover { color: var(--rg-gray-700); }

    /* Role selector — card-radio buttons */
    .rg-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    .rg-role-opt {
      padding: .7rem 1rem;
      border: 1.5px solid var(--rg-gray-200); border-radius: var(--rg-r-md);
      cursor: pointer; text-align: center;
      font-size: .8rem; font-weight: 700; color: var(--rg-gray-500);
      background: white;
      transition: border-color .15s, color .15s, background .15s, box-shadow .15s;
      user-select: none;
    }
    .rg-role-opt:hover { border-color: var(--rg-blue-200); color: var(--rg-blue-700); background: var(--rg-blue-50); }
    .rg-role-opt.selected {
      border-color: var(--rg-blue-600); background: var(--rg-blue-50);
      color: var(--rg-blue-700); box-shadow: 0 0 0 3px rgba(37,99,235,.1);
    }
    .rg-role-opt-label { font-size: .65rem; font-weight: 600; opacity: .7; display: block; margin-top: 1px; }

    /* Track pill selector */
    .rg-track-pills { display: flex; gap: .4rem; flex-wrap: wrap; }
    .rg-track-pill {
      padding: 6px 14px; border-radius: 999px;
      border: 1.5px solid var(--rg-gray-200);
      font-size: .775rem; font-weight: 700;
      color: var(--rg-gray-500); background: white;
      cursor: pointer;
      transition: border-color .15s, color .15s, background .15s, box-shadow .15s;
      user-select: none;
    }
    .rg-track-pill:hover { border-color: var(--rg-blue-200); color: var(--rg-blue-700); background: var(--rg-blue-50); }
    .rg-track-pill.selected {
      border-color: var(--rg-blue-600); background: var(--rg-blue-600);
      color: white; box-shadow: 0 1px 4px rgba(37,99,235,.3);
    }

    /* Submit */
    .rg-submit {
      width: 100%; padding: 11px;
      background: var(--rg-blue-600); color: white;
      border: none; border-radius: var(--rg-r-md);
      font-family: var(--rg-font); font-size: .9rem; font-weight: 700;
      cursor: pointer; margin-top: 1.25rem;
      transition: background .15s, box-shadow .15s, opacity .15s;
      box-shadow: 0 1px 3px rgba(37,99,235,.25);
      display: flex; align-items: center; justify-content: center; gap: .4rem;
    }
    .rg-submit:hover:not(:disabled) { background: var(--rg-blue-700); box-shadow: 0 4px 12px rgba(37,99,235,.32); }
    .rg-submit:disabled { opacity: .55; cursor: not-allowed; }

    /* Sign in link */
    .rg-signin { text-align: center; margin-top: 1.4rem; font-size: .82rem; color: var(--rg-gray-500); }
    .rg-signin a { color: var(--rg-blue-600); font-weight: 700; text-decoration: none; transition: color .15s; }
    .rg-signin a:hover { color: var(--rg-blue-700); }

    /* Section divider label */
    .rg-section-label {
      font-size: .63rem; font-weight: 800; letter-spacing: .1em;
      text-transform: uppercase; color: var(--rg-gray-400);
      margin: 1.1rem 0 .6rem;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .rg-left  { display: none; }
      .rg-right { width: 100%; background: white; padding: 2rem 1rem; }
      .rg-form-card { box-shadow: none; border: none; padding: 1.5rem 1rem; }
    }
    @media (max-width: 480px) {
      .rg-grid2 { grid-template-columns: 1fr; }
      .rg-role-grid { grid-template-columns: 1fr 1fr; }
    }
  `}</style>
);

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "student",
    track: "frontend",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Logic unchanged */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/", formData);
      toast.success("Account created! Please log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed. Try again.");
      setLoading(false);
    }
  };

  const tracks = [
    { value: "frontend",  label: "Frontend"  },
    { value: "backend",   label: "Backend"   },
    { value: "fullstack", label: "Fullstack" },
  ];

  const roles = [
    { value: "student",    label: "Student",    sub: "I want to learn" },
    { value: "instructor", label: "Instructor", sub: "I want to teach" },
  ];

  return (
    <>
      <GlobalStyles />
      <Navbar />

      <main className="rg-main">
        <div className="rg-split">

          {/* ── Left panel ── */}
          <div className="rg-left">
            {/* Brand mark */}
            <div className="rg-brand">
              <div className="rg-brand-icon"><GraduationCap size={22} /></div>
              <span style={{ fontFamily: "var(--rg-serif)", fontSize: "1.5rem", fontStyle: "italic", color: "white" }}>Devoria</span>
            </div>

            {/* Headline */}
            <div className="rg-left-copy">
              <h2 className="rg-left-headline">
                Your journey<br /><em>starts here.</em>
              </h2>
              <p className="rg-left-sub">
                Join hundreds of students and instructors building real-world skills on a structured, cohort-based curriculum.
              </p>
            </div>

            {/* Steps */}
            <div className="rg-steps">
              {[
                { n: "1", text: <><strong>Create your account</strong> — choose your role and track.</> },
                { n: "2", text: <><strong>Join a cohort</strong> — enter your class code from your instructor.</> },
                { n: "3", text: <><strong>Start building</strong> — submit work, get graded, grow your portfolio.</> },
              ].map(({ n, text }) => (
                <div key={n} className="rg-step">
                  <div className="rg-step-num">{n}</div>
                  <p className="rg-step-text">{text}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="rg-quote">
              <p className="rg-quote-text">
                "I went from zero to landing my first dev job — the cohort structure kept me accountable the whole way through."
              </p>
              <p className="rg-quote-author">— Ama O., Frontend Graduate · Cohort 2</p>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="rg-right">
            <div className="rg-form-card">

              {/* Header */}
              <div className="rg-form-icon"><GraduationCap size={22} /></div>
              <h2 className="rg-form-title">Join Devoria</h2>
              <p className="rg-form-sub">Create your account to start your journey.</p>

              <form onSubmit={handleSubmit}>

                {/* Name row */}
                <div className="rg-grid2">
                  <div className="rg-field">
                    <label className="rg-label">First Name</label>
                    <input
                      required type="text" placeholder="Sarah"
                      className="rg-input"
                      value={formData.first_name}
                      onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Last Name</label>
                    <input
                      required type="text" placeholder="Jenkins"
                      className="rg-input"
                      value={formData.last_name}
                      onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="rg-field">
                  <label className="rg-label">Email Address</label>
                  <input
                    required type="email" placeholder="you@example.com"
                    className="rg-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div className="rg-field">
                  <label className="rg-label">Password</label>
                  <div className="rg-pw-wrap">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="rg-input has-toggle"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="rg-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role selector */}
                <div className="rg-field">
                  <label className="rg-label">I am a…</label>
                  <div className="rg-role-grid">
                    {roles.map(r => (
                      <div
                        key={r.value}
                        className={`rg-role-opt${formData.role === r.value ? " selected" : ""}`}
                        onClick={() => setFormData({ ...formData, role: r.value })}
                      >
                        {r.label}
                        <span className="rg-role-opt-label">{r.sub}</span>
                      </div>
                    ))}
                  </div>
                  {/* Hidden select keeps the form value for accessibility / server */}
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    style={{ display: "none" }}
                    aria-hidden="true"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                {/* Track selector */}
                <div className="rg-field">
                  <label className="rg-label">Track</label>
                  <div className="rg-track-pills">
                    {tracks.map(t => (
                      <div
                        key={t.value}
                        className={`rg-track-pill${formData.track === t.value ? " selected" : ""}`}
                        onClick={() => setFormData({ ...formData, track: t.value })}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>
                  {/* Hidden select keeps the form value */}
                  <select
                    value={formData.track}
                    onChange={e => setFormData({ ...formData, track: e.target.value })}
                    style={{ display: "none" }}
                    aria-hidden="true"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="rg-submit">
                  {loading ? "Creating account…" : <>Create Account <ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="rg-signin">
                Already have an account? <Link href="/login">Sign in</Link>
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}