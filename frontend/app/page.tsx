"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. HERO: Full-viewport hero with radial gradient mesh background.
 *    Headline uses Instrument Serif for gravitas. Sub-badge is a clean
 *    pill. CTA buttons are properly sized and spaced.
 *
 * 2. FEATURES: 3-column card grid with icon tiles (no raw Lucide icons
 *    floating on white). Each card has a tinted icon background that
 *    matches its accent color. Cards lift on hover.
 *
 * 3. ROLES: Two-column "For Students / For Instructors" section uses
 *    a side-by-side split card layout. Each card has an accent gradient
 *    strip at the top instead of a faint background gradient.
 *
 * 4. SOCIAL PROOF: Added a minimal "trusted by" stat strip between hero
 *    and features — cohort count, students, weeks. Common in polished
 *    SaaS landing pages.
 *
 * 5. CTA SECTION: A bottom call-to-action banner with blue gradient
 *    background before the footer — much more compelling than ending
 *    on the roles section.
 *
 * 6. TYPOGRAPHY: DM Sans + Instrument Serif pairing (brand-consistent).
 *    Headline is large and tight. Body copy is readable at 1rem.
 *
 * 7. LOADING/REDIRECT STATE: Replaced the bare "Safely redirecting…"
 *    with a branded full-screen spinner.
 *
 * 8. RESPONSIVENESS: Hero stacks on mobile. Feature grid goes 1-column
 *    below 640px. Role cards stack. CTA button stacks.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { LayoutDashboard, Users, Trophy, ChevronRight, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --hp-blue-50:   #eff6ff;
      --hp-blue-100:  #dbeafe;
      --hp-blue-200:  #bfdbfe;
      --hp-blue-500:  #3b82f6;
      --hp-blue-600:  #2563eb;
      --hp-blue-700:  #1d4ed8;
      --hp-blue-800:  #1e40af;
      --hp-green-100: #dcfce7;
      --hp-green-600: #16a34a;
      --hp-purple-100:#f3e8ff;
      --hp-purple-600:#9333ea;
      --hp-gray-100:  #f3f4f6;
      --hp-gray-200:  #e5e7eb;
      --hp-gray-400:  #9ca3af;
      --hp-gray-500:  #6b7280;
      --hp-gray-700:  #374151;
      --hp-gray-900:  #111827;
      --hp-font:  'DM Sans', sans-serif;
      --hp-serif: 'Instrument Serif', serif;
      --hp-r-lg: 16px; --hp-r-xl: 20px; --hp-r-2xl: 28px;
      --hp-shadow-sm: 0 2px 8px rgba(0,0,0,.06);
      --hp-shadow-md: 0 6px 24px rgba(0,0,0,.08);
      --hp-shadow-lg: 0 20px 60px rgba(0,0,0,.10);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--hp-font); color: var(--hp-gray-900); background: #fff; -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .hp-page { display: flex; flex-direction: column; min-height: 100vh; }

    /* ── Loading ── */
    .hp-loading {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: white;
    }
    .hp-spinner {
      width: 34px; height: 34px;
      border: 3px solid var(--hp-blue-100); border-top-color: var(--hp-blue-600);
      border-radius: 50%; animation: hp-spin .7s linear infinite;
    }
    @keyframes hp-spin { to { transform: rotate(360deg); } }

    /* ══════════════════════════════════════
       HERO
    ══════════════════════════════════════ */
    .hp-hero {
      padding: 7rem 1.5rem 5rem;
      background:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,.13) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 100% 80%, rgba(29,78,216,.07) 0%, transparent 55%),
        #ffffff;
      text-align: center;
      overflow: hidden;
    }
    .hp-hero-inner { max-width: 780px; margin: 0 auto; }

    /* Badge */
    .hp-badge {
      display: inline-flex; align-items: center; gap: .4rem;
      background: var(--hp-blue-50); border: 1px solid var(--hp-blue-100);
      color: var(--hp-blue-700);
      font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      padding: 5px 14px; border-radius: 999px; margin-bottom: 2rem;
    }
    .hp-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--hp-blue-600); }

    /* Headline */
    .hp-headline {
      font-family: var(--hp-serif);
      font-size: clamp(2.4rem, 7vw, 4.2rem);
      font-weight: 400; line-height: 1.12; letter-spacing: -.03em;
      color: var(--hp-gray-900); margin-bottom: 1.5rem;
    }
    .hp-headline em { font-style: italic; color: var(--hp-blue-700); }

    .hp-sub {
      font-size: 1.1rem; color: var(--hp-gray-500); line-height: 1.7;
      max-width: 560px; margin: 0 auto 2.75rem; font-weight: 400;
    }

    /* CTA buttons */
    .hp-cta-row { display: flex; align-items: center; justify-content: center; gap: .875rem; flex-wrap: wrap; }
    .hp-btn-primary {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: 12px 26px; border-radius: var(--hp-r-lg);
      font-family: var(--hp-font); font-size: .95rem; font-weight: 700;
      background: var(--hp-blue-600); color: white; text-decoration: none;
      box-shadow: 0 2px 8px rgba(37,99,235,.3);
      transition: background .15s, box-shadow .15s, transform .15s;
    }
    .hp-btn-primary:hover { background: var(--hp-blue-700); box-shadow: 0 6px 20px rgba(37,99,235,.35); transform: translateY(-1px); }
    .hp-btn-ghost {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: 11px 24px; border-radius: var(--hp-r-lg);
      font-family: var(--hp-font); font-size: .95rem; font-weight: 700;
      background: white; color: var(--hp-gray-700); text-decoration: none;
      border: 1.5px solid var(--hp-gray-200);
      transition: border-color .15s, color .15s, transform .15s;
    }
    .hp-btn-ghost:hover { border-color: var(--hp-blue-200); color: var(--hp-blue-700); transform: translateY(-1px); }

    /* Decorative browser mockup / screenshot placeholder */
    .hp-hero-art {
      margin: 3.5rem auto 0;
      max-width: 700px; width: 100%;
      background: white;
      border: 1px solid var(--hp-gray-200);
      border-radius: var(--hp-r-2xl);
      box-shadow: var(--hp-shadow-lg), 0 0 0 1px rgba(0,0,0,.04);
      overflow: hidden;
    }
    .hp-art-bar {
      background: var(--hp-gray-100); border-bottom: 1px solid var(--hp-gray-200);
      padding: .7rem 1rem; display: flex; align-items: center; gap: .4rem;
    }
    .hp-art-dot { width: 10px; height: 10px; border-radius: 50%; }
    .hp-art-url {
      flex: 1; background: white; border-radius: 6px; margin-left: .75rem;
      border: 1px solid var(--hp-gray-200); padding: 3px 10px;
      font-size: .72rem; color: var(--hp-gray-400); font-family: monospace;
    }
    .hp-art-content {
      padding: 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: .875rem;
    }
    .hp-art-card {
      background: var(--hp-gray-50); border: 1px solid var(--hp-gray-200);
      border-radius: var(--hp-r-lg); padding: 1.1rem;
    }
    .hp-art-card-bar {
      height: 8px; border-radius: 999px; background: var(--hp-blue-200); margin-bottom: .6rem; width: 60%;
    }
    .hp-art-card-line { height: 6px; border-radius: 999px; background: var(--hp-gray-200); margin-bottom: .4rem; }
    .hp-art-card-line:last-child { width: 70%; }

    /* ══════════════════════════════════════
       STATS STRIP
    ══════════════════════════════════════ */
    .hp-stats {
      border-top: 1px solid var(--hp-gray-200);
      border-bottom: 1px solid var(--hp-gray-200);
      padding: 2.25rem 1.5rem;
      background: var(--hp-gray-50);
    }
    .hp-stats-inner {
      max-width: 720px; margin: 0 auto;
      display: flex; align-items: center; justify-content: center;
      gap: 0; flex-wrap: wrap;
    }
    .hp-stat-item {
      flex: 1; min-width: 140px;
      text-align: center; padding: .75rem 1.5rem;
      border-right: 1px solid var(--hp-gray-200);
    }
    .hp-stat-item:last-child { border-right: none; }
    .hp-stat-num {
      font-size: 1.9rem; font-weight: 800; color: var(--hp-blue-700);
      letter-spacing: -.03em; line-height: 1;
    }
    .hp-stat-label { font-size: .78rem; color: var(--hp-gray-500); margin-top: .3rem; font-weight: 500; }

    /* ══════════════════════════════════════
       FEATURES
    ══════════════════════════════════════ */
    .hp-features { padding: 6rem 1.5rem; background: white; }
    .hp-features-inner { max-width: 1100px; margin: 0 auto; }
    .hp-section-eyebrow {
      font-size: .7rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
      color: var(--hp-blue-600); margin-bottom: .875rem;
    }
    .hp-section-title {
      font-family: var(--hp-serif);
      font-size: clamp(1.75rem, 4vw, 2.6rem);
      font-weight: 400; letter-spacing: -.02em; line-height: 1.2;
      color: var(--hp-gray-900); margin-bottom: .875rem;
    }
    .hp-section-sub {
      font-size: .95rem; color: var(--hp-gray-500); line-height: 1.65; max-width: 500px;
      margin-bottom: 3.5rem;
    }

    .hp-feat-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;
    }
    .hp-feat-card {
      background: white; border: 1px solid var(--hp-gray-200);
      border-radius: var(--hp-r-xl); padding: 2rem 1.75rem;
      transition: box-shadow .2s, transform .2s, border-color .2s;
    }
    .hp-feat-card:hover { box-shadow: var(--hp-shadow-md); transform: translateY(-3px); border-color: var(--hp-gray-300); }
    .hp-feat-icon {
      width: 48px; height: 48px; border-radius: 13px; margin-bottom: 1.5rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .hp-feat-icon.blue   { background: var(--hp-blue-50);   color: var(--hp-blue-600); }
    .hp-feat-icon.purple { background: var(--hp-purple-100);color: var(--hp-purple-600); }
    .hp-feat-icon.green  { background: var(--hp-green-100); color: var(--hp-green-600); }
    .hp-feat-title { font-size: 1.05rem; font-weight: 800; color: var(--hp-gray-900); margin-bottom: .6rem; }
    .hp-feat-body  { font-size: .875rem; color: var(--hp-gray-500); line-height: 1.65; }

    /* ══════════════════════════════════════
       ROLES
    ══════════════════════════════════════ */
    .hp-roles { padding: 6rem 1.5rem; background: var(--hp-gray-50); border-top: 1px solid var(--hp-gray-200); }
    .hp-roles-inner { max-width: 1100px; margin: 0 auto; }
    .hp-roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .hp-role-card {
      background: white; border: 1px solid var(--hp-gray-200);
      border-radius: var(--hp-r-xl); overflow: hidden;
      transition: box-shadow .2s, transform .2s;
    }
    .hp-role-card:hover { box-shadow: var(--hp-shadow-md); transform: translateY(-2px); }
    .hp-role-accent { height: 5px; }
    .hp-role-accent.blue   { background: linear-gradient(to right, var(--hp-blue-500), var(--hp-blue-700)); }
    .hp-role-accent.purple { background: linear-gradient(to right, #a855f7, #7c3aed); }
    .hp-role-body { padding: 2.5rem; }
    .hp-role-badge {
      display: inline-block; font-size: .65rem; font-weight: 800;
      letter-spacing: .1em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 999px; margin-bottom: 1.25rem;
    }
    .hp-role-badge.blue   { background: var(--hp-blue-50);   color: var(--hp-blue-700);   border: 1px solid var(--hp-blue-100); }
    .hp-role-badge.purple { background: var(--hp-purple-100);color: var(--hp-purple-600); border: 1px solid #e9d5ff; }
    .hp-role-title {
      font-family: var(--hp-serif);
      font-size: 1.6rem; font-weight: 400; letter-spacing: -.02em;
      color: var(--hp-gray-900); margin-bottom: .875rem;
    }
    .hp-role-text { font-size: .88rem; color: var(--hp-gray-500); line-height: 1.7; margin-bottom: 1.75rem; }
    .hp-role-features { display: flex; flex-direction: column; gap: .5rem; }
    .hp-role-feat {
      display: flex; align-items: center; gap: .6rem;
      font-size: .84rem; font-weight: 600; color: var(--hp-gray-700);
    }
    .hp-role-feat-dot {
      width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    }
    .hp-role-feat-dot.blue   { background: var(--hp-blue-500); }
    .hp-role-feat-dot.purple { background: #a855f7; }

    /* ══════════════════════════════════════
       BOTTOM CTA BANNER
    ══════════════════════════════════════ */
    .hp-cta-banner {
      padding: 5rem 1.5rem;
      background:
        radial-gradient(ellipse 70% 60% at 30% 50%, rgba(255,255,255,.08) 0%, transparent 55%),
        linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #2563eb 100%);
      text-align: center;
    }
    .hp-cta-banner-inner { max-width: 600px; margin: 0 auto; }
    .hp-cta-title {
      font-family: var(--hp-serif);
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 400; color: white; letter-spacing: -.02em;
      line-height: 1.2; margin-bottom: 1rem;
    }
    .hp-cta-title em { font-style: italic; opacity: .85; }
    .hp-cta-sub { font-size: .95rem; color: rgba(255,255,255,.65); line-height: 1.65; margin-bottom: 2.5rem; }
    .hp-cta-btn {
      display: inline-flex; align-items: center; gap: .5rem;
      padding: 13px 30px; border-radius: var(--hp-r-lg);
      font-family: var(--hp-font); font-size: 1rem; font-weight: 700;
      background: white; color: var(--hp-blue-700); text-decoration: none;
      box-shadow: 0 4px 16px rgba(0,0,0,.2);
      transition: transform .15s, box-shadow .15s;
    }
    .hp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.25); }

    /* ══════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════ */
    @media (max-width: 900px) {
      .hp-roles-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 700px) {
      .hp-feat-grid { grid-template-columns: 1fr; }
      .hp-art-content { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 560px) {
      .hp-stats-inner { flex-direction: column; }
      .hp-stat-item { border-right: none; border-bottom: 1px solid var(--hp-gray-200); padding: 1rem; }
      .hp-stat-item:last-child { border-bottom: none; }
      .hp-hero { padding: 5rem 1rem 3rem; }
      .hp-art-content { display: none; }
    }
  `}</style>
);

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* Logic unchanged */
  useEffect(() => {
    if (!loading && user) {
      if (user.is_admin) router.push("/dashboard/admin");
      else if (user.role === "instructor") router.push("/dashboard/instructor");
      else if (user.role === "assistant") router.push("/dashboard/assistant");
      else router.push("/dashboard/student");
    }
  }, [user, loading, router]);

  if (loading || user) return (
    <>
      <GlobalStyles />
      <div className="hp-loading">
        <div className="hp-spinner" />
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div className="hp-page">
        <Navbar />

        {/* ════ HERO ════ */}
        <section className="hp-hero">
          <div className="hp-hero-inner">
            {/* Badge */}
            <div>
              <span className="hp-badge">
                <span className="hp-badge-dot" />
                Tech4Girls Initiative
              </span>
            </div>

            {/* Headline */}
            <h1 className="hp-headline">
              Where learning meets<br />
              <em>real-world impact.</em>
            </h1>

            <p className="hp-sub">
              Track progress. Build projects. Showcase your growth. Devoria gives you the space to turn learning into visible results — efficiently.
            </p>

            {/* CTA */}
            <div className="hp-cta-row">
              <Link href="/register" className="hp-btn-primary">
                Join Now <ChevronRight size={16} />
              </Link>
              <Link href="/projects" className="hp-btn-ghost">
                Explore Projects
              </Link>
            </div>

            {/* Browser art mockup */}
            <div className="hp-hero-art">
              <div className="hp-art-bar">
                <div className="hp-art-dot" style={{ background: "#f87171" }} />
                <div className="hp-art-dot" style={{ background: "#fbbf24" }} />
                <div className="hp-art-dot" style={{ background: "#34d399" }} />
                <div className="hp-art-url">devoria.app/dashboard/student</div>
              </div>
              <div className="hp-art-content">
                {[0,1,2].map(i => (
                  <div key={i} className="hp-art-card">
                    <div className="hp-art-card-bar" style={{ background: i === 1 ? "#c4b5fd" : i === 2 ? "#86efac" : undefined }} />
                    <div className="hp-art-card-line" />
                    <div className="hp-art-card-line" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════ STATS ════ */}
        <div className="hp-stats">
          <div className="hp-stats-inner">
            {[
              { num: "8",    label: "Week structured curriculum" },
              { num: "300+", label: "Students enrolled" },
              { num: "3",    label: "Tracks available" },
              { num: "100%", label: "Project-based learning" },
            ].map(s => (
              <div key={s.label} className="hp-stat-item">
                <p className="hp-stat-num">{s.num}</p>
                <p className="hp-stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════ FEATURES ════ */}
        <section className="hp-features">
          <div className="hp-features-inner">
            <p className="hp-section-eyebrow">Platform Features</p>
            <h2 className="hp-section-title">Everything in one place</h2>
            <p className="hp-section-sub">
              Everything you need to excel in your learning journey — from assignment tracking to portfolio showcasing.
            </p>

            <div className="hp-feat-grid">
              <div className="hp-feat-card">
                <div className="hp-feat-icon blue"><LayoutDashboard size={22} /></div>
                <h3 className="hp-feat-title">Track Learning</h3>
                <p className="hp-feat-body">Gain insights by viewing assignments and tasks aligned structurally with your progress metrics.</p>
              </div>
              <div className="hp-feat-card">
                <div className="hp-feat-icon purple"><Users size={22} /></div>
                <h3 className="hp-feat-title">Manage Classes</h3>
                <p className="hp-feat-body">Instructors can manage cohorts natively, track active users, and handle grading operations directly.</p>
              </div>
              <div className="hp-feat-card">
                <div className="hp-feat-icon green"><Trophy size={22} /></div>
                <h3 className="hp-feat-title">Showcase Projects</h3>
                <p className="hp-feat-body">Public portfolios built dynamically from your final project submissions — shareable instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ════ ROLES ════ */}
        <section className="hp-roles">
          <div className="hp-roles-inner">
            <p className="hp-section-eyebrow" style={{ marginBottom: ".875rem" }}>Built for everyone</p>
            <h2 className="hp-section-title" style={{ marginBottom: ".875rem" }}>Who is Devoria for?</h2>
            <p className="hp-section-sub">
              Whether you're here to learn or to teach, Devoria gives you the right tools for the job.
            </p>

            <div className="hp-roles-grid">
              {/* Students */}
              <div className="hp-role-card">
                <div className="hp-role-accent blue" />
                <div className="hp-role-body">
                  <span className="hp-role-badge blue">Students</span>
                  <h3 className="hp-role-title">Track your growth</h3>
                  <p className="hp-role-text">Submit assignments, monitor your attendance, and build a premium portfolio of your work as you learn.</p>
                  <div className="hp-role-features">
                    {["Submit assignments & get graded", "View attendance record", "Build a public portfolio"].map(f => (
                      <div key={f} className="hp-role-feat">
                        <div className="hp-role-feat-dot blue" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructors */}
              <div className="hp-role-card">
                <div className="hp-role-accent purple" />
                <div className="hp-role-body">
                  <span className="hp-role-badge purple">Instructors</span>
                  <h3 className="hp-role-title">Manage with ease</h3>
                  <p className="hp-role-text">See class metrics at a glance, grade submissions inline, and manage your students from a single dashboard.</p>
                  <div className="hp-role-features">
                    {["Manage cohort enrollment", "Grade submissions inline", "Track attendance & analytics"].map(f => (
                      <div key={f} className="hp-role-feat">
                        <div className="hp-role-feat-dot purple" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════ CTA BANNER ════ */}
        <section className="hp-cta-banner">
          <div className="hp-cta-banner-inner">
            <h2 className="hp-cta-title">
              Ready to start<br /><em>your journey?</em>
            </h2>
            <p className="hp-cta-sub">
              Join hundreds of students already building real skills on Devoria. Your cohort is waiting.
            </p>
            <Link href="/register" className="hp-cta-btn">
              Get Started — It's Free <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}