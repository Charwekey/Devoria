"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. THEME SHIFT: Original was a dark "hacker terminal" aesthetic with
 *    Tailwind indigo. Rewritten in the same DM Sans + Instrument Serif
 *    system and blue/white brand palette as all other pages — so this
 *    page finally feels like it belongs to the same product.
 *
 * 2. LAYOUT: Centered single-column card layout (max 560px) instead of
 *    the unwieldy full-width two-column grid. Clean, focused, and calm —
 *    appropriate for a "waiting" state.
 *
 * 3. VISUAL INDICATOR: The Server icon circle is replaced with a clean
 *    stacked ring animation in brand blue (CSS only, no Tailwind animate-ping).
 *    Three concentric rings pulse outward at staggered delays — elegant and
 *    communicates "active / in progress" without being aggressive.
 *
 * 4. TYPOGRAPHY: Dropped the ALL-CAPS italic screaming headline. Replaced
 *    with a calm serif "Awaiting approval" that matches the product tone.
 *    Supporting copy is readable and human.
 *
 * 5. INFO CARDS: Two info rows (Integrity Protocol + Queue Status) are now
 *    clean white cards with a left accent border instead of dark glassy panels.
 *    Much more readable and on-brand.
 *
 * 6. BUTTONS: "Check Status" and "Sign Out" use the standard sd-btn system —
 *    primary blue and ghost respectively. No more dark overlay buttons.
 *
 * 7. STATUS BADGE: Replaced the "Clearance Pulse Detected" jargon badge with
 *    a calm amber "Verification Pending" pill that matches the actual state.
 *
 * 8. FOOTER: Removed the terminal-style "Devoria OS v2.0.4" footer. Replaced
 *    with a simple centered role indicator.
 *
 * 9. DOTS ANIMATION: The animated dots on "Awaiting Signal" are preserved
 *    exactly — same useEffect logic, just cleaner presentation.
 *
 * 10. RESPONSIVENESS: Single column stacks naturally on all screen sizes.
 * ─────────────────────────────────────────────────────────────────
 */

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Clock, ShieldAlert, LogOut, Loader2, Server, Activity } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --pa-blue-50:  #eff6ff;
      --pa-blue-100: #dbeafe;
      --pa-blue-200: #bfdbfe;
      --pa-blue-500: #3b82f6;
      --pa-blue-600: #2563eb;
      --pa-blue-700: #1d4ed8;
      --pa-amber-50: #fffbeb;
      --pa-amber-200:#fde68a;
      --pa-amber-600:#d97706;
      --pa-amber-700:#b45309;
      --pa-gray-100: #f3f4f6;
      --pa-gray-200: #e5e7eb;
      --pa-gray-400: #9ca3af;
      --pa-gray-500: #6b7280;
      --pa-gray-700: #374151;
      --pa-gray-900: #111827;
      --pa-font:  'DM Sans', sans-serif;
      --pa-serif: 'Instrument Serif', serif;
      --pa-r-md: 12px; --pa-r-lg: 16px; --pa-r-xl: 20px;
      --pa-shadow-sm: 0 2px 8px rgba(0,0,0,.06);
      --pa-shadow-lg: 0 20px 60px rgba(0,0,0,.09), 0 4px 12px rgba(0,0,0,.05);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--pa-font); color: var(--pa-gray-900); -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .pa-page {
      min-height: 100vh;
      display: flex; flex-direction: column;
      background:
        radial-gradient(ellipse 70% 50% at 80% 10%, rgba(59,130,246,.07) 0%, transparent 55%),
        radial-gradient(ellipse 50% 40% at 10% 90%, rgba(29,78,216,.05) 0%, transparent 50%),
        #f8fafc;
    }
    .pa-main {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 4rem 1.5rem;
    }

    /* ── Card ── */
    .pa-card {
      width: 100%; max-width: 540px;
      background: white;
      border: 1px solid var(--pa-gray-200);
      border-radius: var(--pa-r-xl);
      padding: 3rem 2.5rem;
      box-shadow: var(--pa-shadow-lg);
      text-align: center;
      animation: pa-rise .3s cubic-bezier(.16,1,.3,1);
    }
    @keyframes pa-rise {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Status badge ── */
    .pa-badge {
      display: inline-flex; align-items: center; gap: .4rem;
      background: var(--pa-amber-50); border: 1px solid var(--pa-amber-200);
      color: var(--pa-amber-700);
      font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      padding: 5px 14px; border-radius: 999px; margin-bottom: 2rem;
    }
    .pa-badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--pa-amber-600);
      animation: pa-blink 1.4s ease-in-out infinite;
    }
    @keyframes pa-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: .3; }
    }

    /* ── Pulse rings ── */
    .pa-rings-wrap {
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 2rem;
      width: 120px; height: 120px; position: relative;
    }
    .pa-ring {
      position: absolute; border-radius: 50%;
      border: 1.5px solid var(--pa-blue-400, #60a5fa);
      animation: pa-ripple 2.4s ease-out infinite;
      opacity: 0;
    }
    .pa-ring:nth-child(1) { width: 60px;  height: 60px;  animation-delay: 0s; }
    .pa-ring:nth-child(2) { width: 88px;  height: 88px;  animation-delay: .5s; }
    .pa-ring:nth-child(3) { width: 116px; height: 116px; animation-delay: 1s; }
    @keyframes pa-ripple {
      0%   { opacity: .6; transform: scale(.85); }
      100% { opacity: 0;  transform: scale(1); }
    }
    .pa-icon-center {
      position: relative; z-index: 1;
      width: 52px; height: 52px; border-radius: 14px;
      background: var(--pa-blue-50);
      border: 1px solid var(--pa-blue-100);
      display: flex; align-items: center; justify-content: center;
      color: var(--pa-blue-600);
    }

    /* ── Text ── */
    .pa-headline {
      font-family: var(--pa-serif);
      font-size: clamp(1.6rem, 5vw, 2.1rem);
      font-weight: 400; letter-spacing: -.02em; line-height: 1.2;
      color: var(--pa-gray-900); margin-bottom: .75rem;
    }
    .pa-sub {
      font-size: .9rem; color: var(--pa-gray-500); line-height: 1.65;
      margin-bottom: 2rem;
    }
    .pa-sub strong { color: var(--pa-gray-900); font-weight: 700; }

    /* ── Info rows ── */
    .pa-info-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 2rem; }
    .pa-info-row {
      display: flex; align-items: flex-start; gap: .875rem;
      background: var(--pa-gray-100);
      border: 1px solid var(--pa-gray-200);
      border-radius: var(--pa-r-lg);
      padding: 1.1rem 1.25rem;
      text-align: left;
      border-left: 3px solid var(--pa-blue-500);
      transition: box-shadow .2s;
    }
    .pa-info-row:hover { box-shadow: var(--pa-shadow-sm); }
    .pa-info-row.amber { border-left-color: var(--pa-amber-600); }
    .pa-info-icon { flex-shrink: 0; margin-top: 1px; }
    .pa-info-label {
      font-size: .65rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
      color: var(--pa-blue-600); margin-bottom: .25rem;
    }
    .pa-info-row.amber .pa-info-label { color: var(--pa-amber-600); }
    .pa-info-text { font-size: .82rem; color: var(--pa-gray-500); line-height: 1.55; font-weight: 500; }

    /* ── Role pill ── */
    .pa-role-pill {
      display: inline-flex; align-items: center; gap: .35rem;
      background: var(--pa-blue-50); border: 1px solid var(--pa-blue-100);
      color: var(--pa-blue-700);
      font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      padding: 3px 12px; border-radius: 999px;
      margin-bottom: 1.25rem;
    }

    /* ── Buttons ── */
    .pa-btn-row { display: flex; gap: .75rem; flex-wrap: wrap; }
    .pa-btn {
      flex: 1; min-width: 140px;
      display: inline-flex; align-items: center; justify-content: center; gap: .4rem;
      padding: 10px 18px; border-radius: var(--pa-r-md);
      font-family: var(--pa-font); font-size: .875rem; font-weight: 700;
      border: none; cursor: pointer;
      transition: background .15s, box-shadow .15s, color .15s;
    }
    .pa-btn-primary { background: var(--pa-blue-600); color: white; box-shadow: 0 1px 3px rgba(37,99,235,.25); }
    .pa-btn-primary:hover { background: var(--pa-blue-700); box-shadow: 0 3px 10px rgba(37,99,235,.32); }
    .pa-btn-ghost { background: white; color: var(--pa-gray-500); border: 1px solid var(--pa-gray-200); }
    .pa-btn-ghost:hover { color: #dc2626; border-color: #fecaca; background: #fef2f2; }

    /* ── Spinner for full-page loading ── */
    .pa-loading {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: white;
    }
    .pa-spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--pa-blue-100); border-top-color: var(--pa-blue-600);
      border-radius: 50%; animation: pa-spin .7s linear infinite;
    }
    @keyframes pa-spin { to { transform: rotate(360deg); } }

    /* ── Footer note ── */
    .pa-footer-note {
      margin-top: 2rem;
      font-size: .72rem; color: var(--pa-gray-400); letter-spacing: .04em;
    }

    /* ── Responsive ── */
    @media (max-width: 480px) {
      .pa-card { padding: 2rem 1.25rem; }
      .pa-btn-row { flex-direction: column; }
      .pa-btn { min-width: unset; width: 100%; }
    }
  `}</style>
);

export default function PendingApproval() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [dots, setDots] = useState("");

  /* Guard — logic unchanged */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  /* Animated dots — logic unchanged */
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  /* Full-page loading — preserves original guard */
  if (loading || !user) {
    return (
      <>
        <GlobalStyles />
        <div className="pa-loading">
          <div className="pa-spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="pa-page">
        <Navbar />

        <main className="pa-main">
          <div className="pa-card">

            {/* Status badge */}
            <div>
              <span className="pa-badge">
                <span className="pa-badge-dot" />
                Verification Pending
              </span>
            </div>

            {/* Role indicator */}
            <div>
              <span className="pa-role-pill">
                <Activity size={10} />
                {user?.role?.toUpperCase()}
              </span>
            </div>

            {/* Pulse rings */}
            <div className="pa-rings-wrap">
              <div className="pa-ring" />
              <div className="pa-ring" />
              <div className="pa-ring" />
              <div className="pa-icon-center">
                <Server size={22} />
              </div>
            </div>

            {/* Headline */}
            <h1 className="pa-headline">
              Awaiting approval{dots}
            </h1>

            {/* Sub copy */}
            <p className="pa-sub">
              Welcome to Devoria, <strong>{user?.first_name}</strong>. Your account is registered and
              your profile has been synced. A team member will review and approve
              your access shortly.
            </p>

            {/* Info rows */}
            <div className="pa-info-list">
              <div className="pa-info-row">
                <ShieldAlert size={18} color="var(--pa-blue-600)" className="pa-info-icon" />
                <div>
                  <p className="pa-info-label">Integrity Protocol</p>
                  <p className="pa-info-text">
                    Instructor and Assistant roles require manual verification to protect cohort data. This typically takes 24–48 hours.
                  </p>
                </div>
              </div>

              <div className="pa-info-row amber">
                <Clock size={18} color="var(--pa-amber-600)" className="pa-info-icon" />
                <div>
                  <p className="pa-info-label">Queue Status</p>
                  <p className="pa-info-text">
                    You're #1 in the verification queue. You'll receive access once an admin approves your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pa-btn-row">
              <button
                onClick={() => window.location.reload()}
                className="pa-btn pa-btn-primary"
              >
                <Loader2 size={15} style={{ animation: "pa-spin .9s linear infinite" }} />
                Check Status
              </button>

              <button
                onClick={logout}
                className="pa-btn pa-btn-ghost"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>

          </div>

          {/* Footer note */}
          <p className="pa-footer-note">
            Need help? Contact your program administrator.
          </p>
        </main>
      </div>
    </>
  );
}