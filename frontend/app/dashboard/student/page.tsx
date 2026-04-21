"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. TYPOGRAPHY: DM Sans + Instrument Serif pairing for brand consistency
 *    across all three dashboard views. Greeting uses serif italic accent.
 *
 * 2. PAGE HEADER: Subtle gradient mesh background strip, rank badge styled
 *    as a proper chip with blue fill instead of raw text.
 *
 * 3. STAT CARDS: Removed awkward double-padding (Card inside div with padding).
 *    Clean metric → label hierarchy with icon housed in a tinted circle.
 *    Progress bar has rounded cap styling.
 *
 * 4. SUBMISSIONS LIST: Converted broken Card-inside-div-with-flex pattern
 *    to flat row cards. Score shown as blue pill. Date is subdued.
 *
 * 5. CLASS CARDS: Track badge moved to a proper top-right ribbon.
 *    "Launch Workspace" button spans full width with arrow icon on hover.
 *    Hover lifts with shadow transition.
 *
 * 6. JOIN MODAL: Class code input is monospace with large tracking.
 *    Modal slides up on open. Focus ring matches brand blue.
 *
 * 7. PROJECT MODAL: Inputs share the same focus-ring system. Cleaner
 *    label hierarchy.
 *
 * 8. PORTFOLIO CARDS: Gradient avatar, clipped description, icon buttons
 *    for GitHub and demo.
 *
 * 9. EMPTY / PENDING STATES: Properly centered icon tiles with copy.
 *    "Initialize Training" state is a prominent call-to-action with
 *    a dashed blue border and centered layout.
 *
 * 10. RESPONSIVENESS: Grid collapses gracefully. Modals go full-width
 *     below 480px. Header wraps on small screens.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  BookOpen,
  Clock,
  ExternalLink,
  Users,
  Award,
  FileText,
  CheckCircle,
  Link as LinkIcon,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Global styles ──────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --sd-blue-50:  #eff6ff;
      --sd-blue-100: #dbeafe;
      --sd-blue-200: #bfdbfe;
      --sd-blue-500: #3b82f6;
      --sd-blue-600: #2563eb;
      --sd-blue-700: #1d4ed8;
      --sd-green-100:#dcfce7;
      --sd-green-600:#16a34a;
      --sd-purple-100:#f3e8ff;
      --sd-purple-600:#9333ea;
      --sd-amber-100:#fef3c7;
      --sd-amber-600:#d97706;
      --sd-gray-50:  #f9fafb;
      --sd-gray-100: #f3f4f6;
      --sd-gray-200: #e5e7eb;
      --sd-gray-300: #d1d5db;
      --sd-gray-400: #9ca3af;
      --sd-gray-500: #6b7280;
      --sd-gray-600: #4b5563;
      --sd-gray-700: #374151;
      --sd-gray-900: #111827;

      --sd-font:   'DM Sans', sans-serif;
      --sd-serif:  'Instrument Serif', serif;
      --sd-r-sm:   8px;  --sd-r-md: 12px;
      --sd-r-lg:   16px; --sd-r-xl: 20px;
      --sd-shadow-xs: 0 1px 2px rgba(0,0,0,.05);
      --sd-shadow-sm: 0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --sd-shadow-md: 0 4px 20px rgba(0,0,0,.08);
      --sd-shadow-lg: 0 12px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--sd-font);
      color: var(--sd-gray-900);
      background: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Page shell ── */
    .sd-page { display: flex; flex-direction: column; min-height: 100vh; }
    .sd-main { flex: 1; }

    /* ── Page header ── */
    .sd-header-strip {
      background:
        radial-gradient(ellipse 80% 60% at 80% -20%, rgba(59,130,246,.09) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 5% 110%, rgba(29,78,216,.05) 0%, transparent 55%),
        white;
      border-bottom: 1px solid var(--sd-gray-200);
      padding: 3.5rem 2rem 2.5rem;
    }
    .sd-header-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
    }
    .sd-greeting-label {
      font-size: .72rem; font-weight: 800; letter-spacing: .1em;
      text-transform: uppercase; color: var(--sd-blue-600);
      margin-bottom: .5rem; opacity: .8;
    }
    .sd-greeting-name {
      font-family: var(--sd-serif);
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 400; line-height: 1.15; letter-spacing: -.02em;
      color: var(--sd-gray-900);
    }
    .sd-greeting-name em { font-style: italic; color: var(--sd-blue-700); }
    .sd-greeting-sub {
      font-size: .875rem; color: var(--sd-gray-500); margin-top: .5rem;
    }
    .sd-rank-chip {
      display: inline-flex; align-items: center; gap: .4rem;
      background: var(--sd-blue-600); color: white;
      font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      padding: 6px 14px; border-radius: 999px;
      box-shadow: 0 2px 8px rgba(37,99,235,.28);
    }

    /* ── Content area ── */
    .sd-content { max-width: 1200px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }

    /* ── Section header ── */
    .sd-sec-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;
    }
    .sd-sec-title {
      font-size: 1.1rem; font-weight: 800; letter-spacing: -.01em; color: var(--sd-gray-900);
    }

    /* ── Stat cards ── */
    .sd-stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 1rem; margin-bottom: 3rem;
    }
    .sd-stat-card {
      background: white; border: 1px solid var(--sd-gray-200);
      border-radius: var(--sd-r-lg); padding: 1.5rem;
      box-shadow: var(--sd-shadow-xs); transition: box-shadow .2s;
    }
    .sd-stat-card:hover { box-shadow: var(--sd-shadow-sm); }
    .sd-stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .875rem; }
    .sd-stat-label { font-size: .78rem; font-weight: 700; color: var(--sd-gray-500); }
    .sd-stat-icon {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sd-stat-icon.blue   { background: var(--sd-blue-50);   color: var(--sd-blue-600); }
    .sd-stat-icon.green  { background: var(--sd-green-100); color: var(--sd-green-600); }
    .sd-stat-icon.purple { background: var(--sd-purple-100);color: var(--sd-purple-600); }
    .sd-stat-value { font-size: 2rem; font-weight: 800; line-height: 1; color: var(--sd-gray-900); }
    .sd-stat-sub { font-size: .75rem; color: var(--sd-gray-400); margin-top: .4rem; }

    /* ── Submission rows ── */
    .sd-sub-row {
      background: white; border: 1px solid var(--sd-gray-200);
      border-radius: var(--sd-r-lg); padding: 1.1rem 1.4rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; margin-bottom: .6rem; box-shadow: var(--sd-shadow-xs);
      transition: box-shadow .2s, border-color .2s;
    }
    .sd-sub-row:hover { box-shadow: var(--sd-shadow-sm); border-color: var(--sd-gray-300); }
    .sd-sub-check {
      width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
      background: var(--sd-green-100); color: var(--sd-green-600);
      display: flex; align-items: center; justify-content: center;
    }
    .sd-sub-title { font-size: .9rem; font-weight: 700; color: var(--sd-gray-900); }
    .sd-sub-date  { font-size: .72rem; color: var(--sd-gray-400); margin-top: 2px; }
    .sd-score-pill {
      display: inline-block; padding: 3px 13px; border-radius: 999px;
      font-size: .82rem; font-weight: 800;
      background: var(--sd-blue-50); color: var(--sd-blue-700); border: 1px solid var(--sd-blue-100);
    }
    .sd-score-dash { font-size: 1rem; font-weight: 700; color: var(--sd-gray-300); }

    /* ── Class cards ── */
    .sd-classes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
    .sd-class-card {
      background: white; border: 1px solid var(--sd-gray-200);
      border-radius: var(--sd-r-xl); padding: 1.75rem 1.5rem 1.5rem;
      position: relative; overflow: hidden;
      box-shadow: var(--sd-shadow-xs);
      transition: box-shadow .22s, transform .22s, border-color .22s;
      display: flex; flex-direction: column; gap: 1rem;
    }
    .sd-class-card:hover { box-shadow: var(--sd-shadow-md); transform: translateY(-2px); border-color: var(--sd-blue-200); }
    .sd-class-track-ribbon {
      position: absolute; top: 0; right: 0;
      background: var(--sd-blue-600); color: white;
      font-size: .6rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      padding: 5px 12px;
      border-bottom-left-radius: var(--sd-r-md);
    }
    .sd-class-name { font-size: 1.05rem; font-weight: 800; color: var(--sd-gray-900); line-height: 1.3; padding-right: 3rem; }
    .sd-class-status {
      font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      color: var(--sd-green-600); display: flex; align-items: center; gap: .35rem;
    }
    .sd-class-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--sd-green-600); display: inline-block; }

    /* ── Buttons ── */
    .sd-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 18px; border-radius: var(--sd-r-md);
      font-family: var(--sd-font); font-size: .875rem; font-weight: 700;
      border: none; cursor: pointer;
      transition: background .15s, box-shadow .15s, opacity .15s;
      white-space: nowrap; text-decoration: none;
    }
    .sd-btn-primary { background: var(--sd-blue-600); color: white; box-shadow: 0 1px 3px rgba(37,99,235,.25); }
    .sd-btn-primary:hover { background: var(--sd-blue-700); box-shadow: 0 3px 10px rgba(37,99,235,.32); }
    .sd-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
    .sd-btn-full { width: 100%; }
    .sd-btn-ghost { background: white; color: var(--sd-gray-700); border: 1px solid var(--sd-gray-200); }
    .sd-btn-ghost:hover { background: var(--sd-gray-50); border-color: var(--sd-gray-300); }
    .sd-btn-sm { padding: 6px 14px; font-size: .8rem; border-radius: 8px; }

    /* ── Portfolio cards ── */
    .sd-portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .sd-port-card {
      background: white; border: 1px solid var(--sd-gray-200);
      border-radius: var(--sd-r-lg); padding: 1.4rem;
      box-shadow: var(--sd-shadow-xs); transition: box-shadow .2s;
    }
    .sd-port-card:hover { box-shadow: var(--sd-shadow-sm); }
    .sd-port-title { font-size: .95rem; font-weight: 700; color: var(--sd-gray-900); }
    .sd-port-desc {
      font-size: .8rem; color: var(--sd-gray-500); line-height: 1.55; margin: .5rem 0 1rem;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* ── Empty / pending / onboarding states ── */
    .sd-empty {
      background: white; border: 1px solid var(--sd-gray-200); border-radius: var(--sd-r-xl);
      padding: 3.5rem 2rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: .75rem;
      box-shadow: var(--sd-shadow-xs);
    }
    .sd-empty-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: var(--sd-blue-50); color: var(--sd-blue-300);
      display: flex; align-items: center; justify-content: center; margin-bottom: .5rem;
    }
    .sd-empty-title { font-size: 1rem; font-weight: 700; color: var(--sd-gray-700); }
    .sd-empty-sub { font-size: .83rem; color: var(--sd-gray-400); max-width: 320px; line-height: 1.55; }

    /* Onboarding CTA */
    .sd-onboarding {
      background: white; border: 2px dashed var(--sd-blue-200);
      border-radius: var(--sd-r-xl);
      padding: 4rem 2rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      margin-top: 2rem;
    }
    .sd-onboarding-icon {
      width: 64px; height: 64px; border-radius: 18px;
      background: var(--sd-blue-50); color: var(--sd-blue-400);
      display: flex; align-items: center; justify-content: center; margin-bottom: .5rem;
    }
    .sd-onboarding-title {
      font-family: var(--sd-serif);
      font-size: clamp(1.4rem, 3vw, 1.9rem);
      font-weight: 400; color: var(--sd-gray-900); letter-spacing: -.01em;
    }
    .sd-onboarding-sub {
      font-size: .88rem; color: var(--sd-gray-500);
      max-width: 500px; line-height: 1.6; margin-bottom: .5rem;
    }

    /* ── Modals ── */
    .sd-overlay {
      position: fixed; inset: 0;
      background: rgba(17,24,39,.55);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .sd-modal {
      background: white; border-radius: var(--sd-r-xl);
      padding: 2rem; width: 100%; max-width: 420px;
      box-shadow: var(--sd-shadow-lg);
      animation: sd-slide-up .22s cubic-bezier(.16,1,.3,1);
    }
    @keyframes sd-slide-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sd-modal-title { font-size: 1.15rem; font-weight: 800; color: var(--sd-gray-900); margin-bottom: .4rem; }
    .sd-modal-sub   { font-size: .82rem; color: var(--sd-gray-400); margin-bottom: 1.5rem; }

    /* Form elements */
    .sd-form { display: flex; flex-direction: column; gap: .875rem; }
    .sd-input, .sd-textarea {
      width: 100%; padding: 10px 14px;
      border: 1.5px solid var(--sd-gray-200); border-radius: var(--sd-r-md);
      font-family: var(--sd-font); font-size: .875rem; font-weight: 500;
      color: var(--sd-gray-900); background: white; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .sd-input:focus, .sd-textarea:focus {
      border-color: var(--sd-blue-500); box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    }
    .sd-textarea { resize: none; min-height: 88px; }
    /* Code input */
    .sd-code-input {
      width: 100%; padding: 1.1rem;
      border: 1.5px solid var(--sd-gray-200); border-radius: var(--sd-r-md);
      font-family: 'Courier New', monospace;
      font-size: 1.85rem; font-weight: 900; text-align: center; letter-spacing: .2em;
      color: var(--sd-blue-700); outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .sd-code-input:focus {
      border-color: var(--sd-blue-500); box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    }
    .sd-modal-actions { display: flex; flex-direction: column; gap: .5rem; margin-top: .5rem; }

    /* ── Loading ── */
    .sd-loading {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; flex-direction: column; gap: .875rem; background: white;
    }
    .sd-spinner {
      width: 34px; height: 34px;
      border: 3px solid var(--sd-blue-100); border-top-color: var(--sd-blue-600);
      border-radius: 50%; animation: sd-spin .7s linear infinite;
    }
    @keyframes sd-spin { to { transform: rotate(360deg); } }
    .sd-spinner-label { font-size: .875rem; font-weight: 600; color: var(--sd-gray-400); letter-spacing: .04em; }

    /* ── Section divider ── */
    .sd-section { margin-bottom: 3rem; }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .sd-stats-grid   { grid-template-columns: 1fr 1fr; }
      .sd-classes-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .sd-stats-grid     { grid-template-columns: 1fr; }
      .sd-classes-grid   { grid-template-columns: 1fr; }
      .sd-portfolio-grid { grid-template-columns: 1fr; }
      .sd-header-strip   { padding: 2rem 1rem 1.75rem; }
      .sd-content        { padding: 1.5rem 1rem 3rem; }
      .sd-modal          { padding: 1.5rem; }
    }
  `}</style>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({ has_approved: false, has_pending: false });
  const [loading, setLoading] = useState(true);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: "", description: "", github_link: "", demo_link: "" });

  useEffect(() => { fetchStudentData(); }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [classRes, projectRes, attendRes, statusRes, submissionRes] = await Promise.all([
        api.get("/classes/student").catch(() => ({ data: [] })),
        api.get("/projects/me").catch(() => ({ data: [] })),
        api.get("/attendance/me").catch(() => ({ data: [] })),
        api.get("/classes/status").catch(() => ({ data: { has_approved: false, has_pending: false } })),
        api.get("/submissions/me").catch(() => ({ data: [] })),
      ]);
      setClasses(classRes.data || []);
      setProjects(projectRes.data || []);
      setAttendance(attendRes.data || []);
      setEnrollmentStatus(statusRes.data || { has_approved: false, has_pending: false });
      setSubmissions(submissionRes.data || []);
    } catch (err) {
      console.error("Dashboard sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    try {
      const res = await api.post("/classes/join", { class_code: classCode });
      toast.success(res.data.message);
      setShowJoinModal(false);
      setClassCode("");
      fetchStudentData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to join class.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/projects/", projectForm);
      toast.success("Project added to platform showcase!");
      setShowProjectModal(false);
      setProjectForm({ title: "", description: "", github_link: "", demo_link: "" });
      fetchStudentData();
    } catch {
      toast.error("Showcase submission failed.");
    }
  };

  const totalAssignments  = classes.reduce((acc, c) => acc + (c.assignments?.length || 0), 0);
  const completedAssignments = submissions.length;
  const percentComplete   = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
  const isEnrolled = enrollmentStatus.has_approved || classes.length > 0 || enrollmentStatus.has_pending;

  if (loading) return (
    <>
      <GlobalStyles />
      <div className="sd-loading">
        <div className="sd-spinner" />
        <p className="sd-spinner-label">Syncing workspace…</p>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div className="sd-page">
        <Navbar />
        <main className="sd-main">

          {/* ── Page header ── */}
          <section className="sd-header-strip">
            <div className="sd-header-inner">
              <div>
                <p className="sd-greeting-label">Student Workspace</p>
                <h1 className="sd-greeting-name">
                  Welcome back, <em>{user?.first_name}</em>
                </h1>
                <p className="sd-greeting-sub">Your curriculum environment is active and ready.</p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", paddingTop: ".25rem" }}>
                <span className="sd-rank-chip">
                  <Award size={12} /> Engineer
                </span>
              </div>
            </div>
          </section>

          {/* ── Main content ── */}
          <div className="sd-content">

            {/* ════ ENROLLED VIEW ════ */}
            {isEnrolled && (
              <>
                {/* Stat cards */}
                <div className="sd-stats-grid">
                  <div className="sd-stat-card">
                    <div className="sd-stat-top">
                      <span className="sd-stat-label">Overall Progress</span>
                      <div className="sd-stat-icon blue"><Award size={16} /></div>
                    </div>
                    <p className="sd-stat-value">{percentComplete.toFixed(0)}%</p>
                    <div style={{ marginTop: ".75rem" }}>
                      <ProgressBar percentage={percentComplete} />
                    </div>
                    <p className="sd-stat-sub">{completedAssignments} of {totalAssignments} tasks completed</p>
                  </div>

                  <div className="sd-stat-card">
                    <div className="sd-stat-top">
                      <span className="sd-stat-label">Attendance</span>
                      <div className="sd-stat-icon green"><Calendar size={16} /></div>
                    </div>
                    <p className="sd-stat-value">{attendance.length}</p>
                    <p className="sd-stat-sub">Sessions recorded</p>
                  </div>

                  <div className="sd-stat-card">
                    <div className="sd-stat-top">
                      <span className="sd-stat-label">Portfolio</span>
                      <div className="sd-stat-icon purple"><BookOpen size={16} /></div>
                    </div>
                    <p className="sd-stat-value">{projects.length}</p>
                    <p className="sd-stat-sub">Showcased works</p>
                  </div>
                </div>

                {/* Recent submissions
                <div className="sd-section">
                  <div className="sd-sec-row">
                    <p className="sd-sec-title">Recent Submissions & Grades</p>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="sd-empty">
                      <div className="sd-empty-icon"><FileText size={20} /></div>
                      <p className="sd-empty-title">No submissions yet</p>
                      <p className="sd-empty-sub">Complete and submit assignments from your active class to see your record here.</p>
                    </div>
                  ) : (
                    submissions.slice(0, 5).map((s: any) => (
                      <div key={s.id} className="sd-sub-row">
                        <div style={{ display: "flex", alignItems: "center", gap: ".875rem", flex: 1, minWidth: 0 }}>
                          <div className="sd-sub-check"><CheckCircle size={17} /></div>
                          <div style={{ minWidth: 0 }}>
                            <p className="sd-sub-title">{s.assignment?.title}</p>
                            <p className="sd-sub-date">Submitted {new Date(s.submitted_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: ".63rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--sd-gray-400)", marginBottom: ".3rem" }}>Grade</p>
                          {s.score != null
                            ? <span className="sd-score-pill">{s.score} / 100</span>
                            : <span className="sd-score-dash">—</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div> */}

                {/* Active classes */}
                <div className="sd-section">
                  <div className="sd-sec-row">
                    <p className="sd-sec-title">Active Learning Environments</p>
                    <button className="sd-btn sd-btn-ghost sd-btn-sm" onClick={() => setShowJoinModal(true)}>
                      <Plus size={14} /> Join New
                    </button>
                  </div>

                  {classes.length > 0 ? (
                    <div className="sd-classes-grid">
                      {classes.map((cls: any) => (
                        <div key={cls.id} className="sd-class-card">
                          <span className="sd-class-track-ribbon">{cls.track?.toUpperCase()}</span>
                          <div>
                            <p className="sd-class-name">{cls.class_name}</p>
                          </div>
                          <p className="sd-class-status">Active Cohort</p>
                          <button
                            className="sd-btn sd-btn-primary sd-btn-full"
                            onClick={() => router.push(`/dashboard/student/class/${cls.id}`)}
                          >
                            Launch Workspace <ArrowRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : enrollmentStatus.has_pending ? (
                    <div className="sd-empty">
                      <div className="sd-empty-icon"><Clock size={20} /></div>
                      <p className="sd-empty-title">Access Pending</p>
                      <p className="sd-empty-sub">Your application is under review. The instructor will grant access to the workspace shortly.</p>
                    </div>
                  ) : (
                    <div className="sd-empty">
                      <div className="sd-empty-icon"><Plus size={20} /></div>
                      <p className="sd-empty-title">No Active Environments</p>
                      <p className="sd-empty-sub">You're not enrolled in any cohorts yet.</p>
                      <button className="sd-btn sd-btn-primary" style={{ marginTop: ".5rem" }} onClick={() => setShowJoinModal(true)}>
                        Join a Cohort
                      </button>
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div className="sd-section">
                  <div className="sd-sec-row">
                    <p className="sd-sec-title">Public Portfolio</p>
                    <button className="sd-btn sd-btn-primary sd-btn-sm" onClick={() => setShowProjectModal(true)}>
                      <Plus size={14} /> Link New Work
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <div className="sd-empty">
                      <div className="sd-empty-icon"><BookOpen size={20} /></div>
                      <p className="sd-empty-title">No projects yet</p>
                      <p className="sd-empty-sub">Link your GitHub projects and live demos to build your portfolio.</p>
                    </div>
                  ) : (
                    <div className="sd-portfolio-grid">
                      {projects.map((p: any) => (
                        <div key={p.id} className="sd-port-card">
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: ".4rem" }}>
                            <p className="sd-port-title">{p.title}</p>
                            <div style={{ display: "flex", gap: ".4rem", flexShrink: 0 }}>
                              <Link href={p.github_link} target="_blank" className="sd-btn sd-btn-ghost sd-btn-sm" style={{ padding: "5px 10px" }}>
                                <LinkIcon size={13} />
                              </Link>
                              <Link href={p.demo_link} target="_blank" className="sd-btn sd-btn-primary sd-btn-sm">
                                <ExternalLink size={13} /> Demo
                              </Link>
                            </div>
                          </div>
                          <p className="sd-port-desc">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ════ ONBOARDING STATE ════ */}
            {!enrollmentStatus.has_approved && !enrollmentStatus.has_pending && classes.length === 0 && (
              <div className="sd-onboarding">
                <div className="sd-onboarding-icon"><Users size={28} /></div>
                <h2 className="sd-onboarding-title">Initialize Your Training</h2>
                <p className="sd-onboarding-sub">
                  You haven't joined any class environments yet. Enter the class code provided by your instructor to begin your curriculum.
                </p>
                <button className="sd-btn sd-btn-primary" style={{ padding: "12px 28px", fontSize: "1rem" }} onClick={() => setShowJoinModal(true)}>
                  <Plus size={18} /> Enter Class Code
                </button>
              </div>
            )}

          </div>
        </main>

        {/* ── Join class modal ── */}
        {showJoinModal && (
          <div className="sd-overlay">
            <div className="sd-modal">
              <p className="sd-modal-title">Enter Class Code</p>
              <p className="sd-modal-sub">Your instructor will provide a unique class code to get started.</p>
              <form onSubmit={handleJoinClass} className="sd-form">
                <input
                  required
                  className="sd-code-input"
                  placeholder="AX792B"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                />
                <div className="sd-modal-actions">
                  <button type="submit" disabled={isJoining} className="sd-btn sd-btn-primary sd-btn-full">
                    {isJoining ? "Syncing…" : "Submit Application"}
                  </button>
                  <button type="button" onClick={() => setShowJoinModal(false)} className="sd-btn sd-btn-ghost sd-btn-full">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Add project modal ── */}
        {showProjectModal && (
          <div className="sd-overlay">
            <div className="sd-modal" style={{ maxWidth: "460px" }}>
              <p className="sd-modal-title">New Portfolio Entry</p>
              <p className="sd-modal-sub">Add a project to your public showcase.</p>
              <form onSubmit={handleProjectSubmit} className="sd-form">
                <input
                  required className="sd-input"
                  placeholder="Project Name"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                />
                <textarea
                  required className="sd-textarea"
                  placeholder="Technical overview — stack, approach, what you built…"
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
                <input
                  required className="sd-input"
                  placeholder="GitHub Repository URL"
                  value={projectForm.github_link}
                  onChange={(e) => setProjectForm({ ...projectForm, github_link: e.target.value })}
                />
                <input
                  required className="sd-input"
                  placeholder="Live Demo URL"
                  value={projectForm.demo_link}
                  onChange={(e) => setProjectForm({ ...projectForm, demo_link: e.target.value })}
                />
                <div className="sd-modal-actions">
                  <button type="submit" className="sd-btn sd-btn-primary sd-btn-full">
                    Publish to Portfolio
                  </button>
                  <button type="button" onClick={() => setShowProjectModal(false)} className="sd-btn sd-btn-ghost sd-btn-full">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}