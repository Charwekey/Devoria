"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. TYPOGRAPHY: DM Sans + Instrument Serif pairing (matches instructor
 *    dashboard for brand consistency). Tight letter-spacing on class name,
 *    uppercase tracking on labels.
 *
 * 2. HERO SECTION: Radial gradient mesh background. Stats pulled out of
 *    awkward nested Card+div pattern into clean "stat pill" components
 *    with proper label → number → sub-label hierarchy.
 *
 * 3. SIDEBAR: Identical pill-nav system to instructor view — icon containers,
 *    active state as solid blue with drop-shadow, hover tint.
 *
 * 4. ASSIGNMENT CARDS: Final-project cards get a distinct amber accent strip.
 *    Expanded submission form lives inside a clean inset panel. File upload
 *    zone is a proper dashed drop-area. Pending badge replaces plain text.
 *
 * 5. SUBMISSION FORM: Inputs share the focused blue ring system. File upload
 *    label is properly clickable and shows filename. Submit button is full-
 *    width on mobile.
 *
 * 6. SUBMISSIONS TAB: Score displayed as a pill badge. Green/amber color
 *    coding. Unsubmit icon button is visually separated with a divider.
 *
 * 7. MATERIALS TAB: Download button uses icon + text, sits flush-right.
 *    Material-type badge system matches instructor view.
 *
 * 8. ATTENDANCE TABLE: Alternating row tints, wider status pill, column
 *    headers styled as uppercase labels.
 *
 * 9. PORTFOLIO/SHOWCASE: Cards use gradient avatar, clipped description
 *    with line-clamp, link buttons properly sized.
 *
 * 10. LOADING & EMPTY STATES: Spinner + text for loading; icon tile + copy
 *     for each empty state.
 *
 * 11. RESPONSIVENESS: Sidebar becomes horizontal scroll tab-bar on mobile.
 *     Stats wrap and stack. Assignment form stacks to single column.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, use } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Check,
  Trophy,
  ChevronLeft,
  Upload,
  ExternalLink,
  Award,
  Terminal,
  Monitor,
  Layout,
  Link as LinkIcon,
  CheckCircle,
  BarChart3,
  Trash2,
  Download,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Global styles (injected once) ───────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --s-blue-50:  #eff6ff;
      --s-blue-100: #dbeafe;
      --s-blue-200: #bfdbfe;
      --s-blue-500: #3b82f6;
      --s-blue-600: #2563eb;
      --s-blue-700: #1d4ed8;
      --s-blue-800: #1e40af;
      --s-green-100:#dcfce7;
      --s-green-600:#16a34a;
      --s-green-700:#15803d;
      --s-red-100:  #fee2e2;
      --s-red-600:  #dc2626;
      --s-amber-50: #fffbeb;
      --s-amber-400:#fbbf24;
      --s-amber-600:#d97706;
      --s-amber-800:#92400e;
      --s-gray-50:  #f9fafb;
      --s-gray-100: #f3f4f6;
      --s-gray-200: #e5e7eb;
      --s-gray-300: #d1d5db;
      --s-gray-400: #9ca3af;
      --s-gray-500: #6b7280;
      --s-gray-600: #4b5563;
      --s-gray-700: #374151;
      --s-gray-900: #111827;
      --s-purple-100:#f3e8ff;
      --s-purple-600:#9333ea;

      --s-font: 'DM Sans', sans-serif;
      --s-serif: 'Instrument Serif', serif;
      --s-r-sm: 8px; --s-r-md: 12px; --s-r-lg: 16px; --s-r-xl: 20px;
      --s-shadow-xs: 0 1px 2px rgba(0,0,0,.05);
      --s-shadow-sm: 0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --s-shadow-md: 0 4px 20px rgba(0,0,0,.08);
      --s-shadow-lg: 0 12px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--s-font); color: var(--s-gray-900); background: #f8fafc; -webkit-font-smoothing: antialiased; }

    /* ── Layout ── */
    .scd-page   { min-height: 100vh; display: flex; flex-direction: column; }
    .scd-main   { flex: 1; display: flex; flex-direction: column; }
    .scd-body   { display: flex; flex: 1; }

    /* ── Hero ── */
    .scd-hero {
      padding: 3.5rem 2rem 2.5rem;
      background:
        radial-gradient(ellipse 80% 60% at 70% -20%, rgba(59,130,246,.10) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 5%  110%, rgba(29,78,216,.06) 0%, transparent 60%),
        #ffffff;
      border-bottom: 1px solid var(--s-gray-200);
    }
    .scd-hero-inner {
      max-width: 1280px; margin: 0 auto;
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
    }
    .scd-back {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.78rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
      color: var(--s-blue-600); text-decoration: none; margin-bottom: 1.2rem;
      opacity: .8; transition: opacity .2s;
    }
    .scd-back:hover { opacity: 1; }
    .scd-class-name {
      font-family: var(--s-serif);
      font-size: clamp(1.6rem, 4vw, 2.6rem);
      font-weight: 400; line-height: 1.15; letter-spacing: -.02em;
      color: var(--s-gray-900); margin-bottom: 1rem;
    }
    .scd-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .scd-track-badge {
      font-size: 0.68rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      background: var(--s-blue-600); color: #fff;
      padding: 4px 12px; border-radius: 999px;
    }
    .scd-cycle-info {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.82rem; font-weight: 500; color: var(--s-gray-500);
    }

    /* Stat pills */
    .scd-stats { display: flex; gap: .75rem; flex-wrap: wrap; align-items: stretch; }
    .scd-stat {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      padding: 1.1rem 1.5rem; text-align: center; box-shadow: var(--s-shadow-xs); min-width: 100px;
    }
    .scd-stat-label {
      font-size: 0.63rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: var(--s-gray-400); margin-bottom: .45rem;
    }
    .scd-stat-value { font-size: 1.85rem; font-weight: 800; line-height: 1; color: var(--s-gray-900); }
    .scd-stat-value.blue { color: var(--s-blue-700); }
    .scd-stat-sub { font-size: 0.65rem; font-weight: 700; color: var(--s-green-600); margin-top: .3rem; letter-spacing: .06em; }

    /* ── Sidebar ── */
    .scd-sidebar {
      width: 220px; flex-shrink: 0;
      padding: 2rem 1rem; border-right: 1px solid var(--s-gray-200);
      background: white; display: flex; flex-direction: column; gap: 3px;
    }
    .scd-nav-btn {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 12px; border-radius: var(--s-r-md);
      font-size: 0.855rem; font-weight: 600;
      border: none; cursor: pointer; width: 100%; text-align: left;
      transition: background .15s, color .15s, box-shadow .15s;
      color: var(--s-gray-500); background: transparent;
    }
    .scd-nav-btn:hover { background: var(--s-blue-50); color: var(--s-blue-700); }
    .scd-nav-btn.active {
      background: var(--s-blue-600); color: white;
      box-shadow: 0 2px 8px rgba(37,99,235,.28);
    }
    .scd-nav-icon {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0; transition: background .15s;
    }
    .scd-nav-btn.active .scd-nav-icon { background: rgba(255,255,255,.18); }

    /* ── Workspace ── */
    .scd-workspace { flex: 1; padding: 2.5rem; background: #f8fafc; min-width: 0; }

    /* Section header */
    .scd-sec-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
    .scd-sec-title { font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; color: var(--s-gray-900); }
    .scd-sec-sub { font-size: 0.82rem; color: var(--s-gray-500); margin-top: .25rem; }

    /* ── Assignment cards ── */
    .scd-assn-card {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      overflow: hidden; margin-bottom: .75rem;
      box-shadow: var(--s-shadow-xs); transition: box-shadow .2s;
    }
    .scd-assn-card:hover { box-shadow: var(--s-shadow-sm); }
    .scd-assn-card.final { border-left: 4px solid var(--s-amber-400); }
    .scd-assn-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 1.5rem; cursor: pointer; gap: 1rem;
    }
    .scd-assn-header:hover { background: var(--s-gray-50); }
    .scd-assn-icon {
      width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
      background: var(--s-blue-50); color: var(--s-blue-400);
      display: flex; align-items: center; justify-content: center;
    }
    .scd-assn-icon.final { background: var(--s-amber-50); color: var(--s-amber-600); }
    .scd-assn-name { font-size: .95rem; font-weight: 700; color: var(--s-gray-900); display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .scd-assn-deadline { font-size: .75rem; color: var(--s-gray-400); margin-top: 2px; font-weight: 500; }
    .scd-pending-badge {
      font-size: .65rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      background: var(--s-gray-100); color: var(--s-gray-500);
      padding: 3px 10px; border-radius: 999px; white-space: nowrap;
    }
    .scd-final-badge {
      font-size: .62rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      background: var(--s-amber-50); color: var(--s-amber-600);
      padding: 2px 8px; border-radius: 999px; border: 1px solid #fde68a;
    }

    /* Expanded submission panel */
    .scd-expand-panel {
      border-top: 1px solid var(--s-gray-200); background: var(--s-gray-50);
      padding: 1.5rem;
    }
    .scd-expand-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
    }
    .scd-task-label {
      font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      color: var(--s-gray-400); margin-bottom: .6rem;
    }
    .scd-task-body { font-size: .88rem; color: var(--s-gray-700); line-height: 1.6; white-space: pre-wrap; }

    /* Submission form */
    .scd-sub-form {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      padding: 1.5rem; display: flex; flex-direction: column; gap: .875rem;
    }
    .scd-sub-form-title { font-size: .9rem; font-weight: 700; color: var(--s-gray-900); }
    .scd-input, .scd-textarea {
      width: 100%; padding: 9px 13px;
      border: 1.5px solid var(--s-gray-200); border-radius: var(--s-r-md);
      font-family: var(--s-font); font-size: .855rem; font-weight: 500;
      color: var(--s-gray-900); background: white; outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .scd-input:focus, .scd-textarea:focus {
      border-color: var(--s-blue-500); box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    }
    .scd-textarea { resize: none; min-height: 80px; }
    .scd-file-zone {
      border: 2px dashed var(--s-gray-200); border-radius: var(--s-r-md);
      padding: .75rem 1rem; cursor: pointer; text-align: center;
      transition: border-color .15s, background .15s;
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      font-size: .78rem; font-weight: 600; color: var(--s-gray-400);
    }
    .scd-file-zone:hover { border-color: var(--s-blue-300); background: var(--s-blue-50); color: var(--s-blue-600); }
    .scd-file-zone.has-file { border-color: var(--s-green-600); color: var(--s-green-600); background: var(--s-green-100); }

    /* ── Buttons ── */
    .scd-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 18px; border-radius: var(--s-r-md);
      font-family: var(--s-font); font-size: .875rem; font-weight: 700;
      border: none; cursor: pointer; transition: background .15s, box-shadow .15s, opacity .15s;
      white-space: nowrap;
    }
    .scd-btn-primary { background: var(--s-blue-600); color: white; box-shadow: 0 1px 3px rgba(37,99,235,.28); }
    .scd-btn-primary:hover { background: var(--s-blue-700); box-shadow: 0 3px 10px rgba(37,99,235,.35); }
    .scd-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
    .scd-btn-ghost { background: white; color: var(--s-gray-700); border: 1px solid var(--s-gray-200); }
    .scd-btn-ghost:hover { background: var(--s-gray-50); border-color: var(--s-gray-300); }
    .scd-btn-sm { padding: 6px 14px; font-size: .8rem; border-radius: 8px; }
    .scd-btn-danger { background: #fef2f2; color: var(--s-red-600); border: 1px solid #fecaca; }
    .scd-btn-danger:hover { background: var(--s-red-100); }
    .scd-icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 8px;
      border: 1px solid var(--s-gray-200); background: white;
      cursor: pointer; color: var(--s-gray-400); transition: background .15s, color .15s;
    }
    .scd-icon-btn.danger:hover { background: #fef2f2; color: var(--s-red-600); border-color: #fecaca; }

    /* ── Submissions tab ── */
    .scd-sub-row {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      padding: 1.25rem 1.5rem; margin-bottom: .75rem;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
      box-shadow: var(--s-shadow-xs); transition: box-shadow .2s;
    }
    .scd-sub-row:hover { box-shadow: var(--s-shadow-sm); }
    .scd-sub-check {
      width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
      background: var(--s-green-100); color: var(--s-green-600);
      display: flex; align-items: center; justify-content: center;
    }
    .scd-sub-title { font-size: .95rem; font-weight: 700; color: var(--s-gray-900); }
    .scd-sub-date { font-size: .75rem; color: var(--s-gray-400); margin-top: 2px; }
    .scd-score-pill {
      display: inline-block; padding: 4px 14px;
      border-radius: 999px; font-size: .85rem; font-weight: 800;
      background: var(--s-blue-50); color: var(--s-blue-700); border: 1px solid var(--s-blue-100);
    }
    .scd-ungraded { font-size: 1.1rem; font-weight: 700; color: var(--s-gray-300); }
    .scd-divider-v { width: 1px; height: 28px; background: var(--s-gray-200); flex-shrink: 0; }

    /* ── Materials tab ── */
    .scd-mat-row {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      padding: 1.25rem 1.5rem; margin-bottom: .75rem;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      box-shadow: var(--s-shadow-xs); transition: box-shadow .2s;
    }
    .scd-mat-row:hover { box-shadow: var(--s-shadow-sm); }
    .scd-type-badge {
      display: inline-block; padding: 2px 10px; border-radius: 999px;
      font-size: .63rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      background: var(--s-blue-50); color: var(--s-blue-700); border: 1px solid var(--s-blue-100);
    }

    /* ── Attendance table ── */
    .scd-attend-card {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      overflow: hidden; box-shadow: var(--s-shadow-xs);
    }
    .scd-attend-table { width: 100%; border-collapse: collapse; }
    .scd-attend-th {
      padding: .875rem 1.25rem; text-align: left;
      font-size: .68rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      color: var(--s-gray-400); background: var(--s-gray-50); border-bottom: 1px solid var(--s-gray-200);
    }
    .scd-attend-td { padding: .875rem 1.25rem; font-size: .875rem; color: var(--s-gray-700); }
    .scd-attend-tr:nth-child(even) td { background: var(--s-gray-50); }
    .scd-attend-tr { border-bottom: 1px solid var(--s-gray-100); }
    .scd-attend-tr:last-child { border-bottom: none; }
    .scd-status-present {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 999px; font-size: .72rem; font-weight: 700;
      background: var(--s-green-100); color: var(--s-green-700);
    }
    .scd-status-absent {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 999px; font-size: .72rem; font-weight: 700;
      background: var(--s-red-100); color: #991b1b;
    }

    /* ── Portfolio ── */
    .scd-portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .scd-portfolio-card {
      background: white; border: 1px solid var(--s-gray-200); border-radius: var(--s-r-lg);
      padding: 1.5rem; box-shadow: var(--s-shadow-xs); transition: box-shadow .2s;
    }
    .scd-portfolio-card:hover { box-shadow: var(--s-shadow-md); }
    .scd-port-avatar {
      width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--s-blue-500), var(--s-blue-800));
      color: white; font-size: 1rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .scd-port-title { font-size: 1rem; font-weight: 700; color: var(--s-gray-900); }
    .scd-port-sub { font-size: .78rem; color: var(--s-gray-500); margin-top: 2px; }
    .scd-port-desc {
      font-size: .83rem; color: var(--s-gray-500); line-height: 1.55;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
      overflow: hidden; margin-bottom: 1.25rem;
    }

    /* ── Loading ── */
    .scd-loading {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 1rem; background: white;
    }
    .scd-spinner {
      width: 34px; height: 34px;
      border: 3px solid var(--s-blue-100); border-top-color: var(--s-blue-600);
      border-radius: 50%; animation: scd-spin .7s linear infinite;
    }
    @keyframes scd-spin { to { transform: rotate(360deg); } }
    .scd-loading-text { font-size: .875rem; font-weight: 600; color: var(--s-gray-400); letter-spacing: .04em; }

    /* ── Empty states ── */
    .scd-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem 2rem; text-align: center;
    }
    .scd-empty-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: var(--s-blue-50); color: var(--s-blue-300);
      display: flex; align-items: center; justify-content: center; margin-bottom: 1.1rem;
    }
    .scd-empty-title { font-size: .95rem; font-weight: 700; color: var(--s-gray-700); margin-bottom: .35rem; }
    .scd-empty-sub { font-size: .82rem; color: var(--s-gray-400); max-width: 260px; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .scd-body { flex-direction: column; }
      .scd-sidebar {
        flex-direction: row; flex-wrap: nowrap; overflow-x: auto;
        width: 100%; border-right: none; border-bottom: 1px solid var(--s-gray-200);
        padding: .75rem; gap: .35rem;
      }
      .scd-nav-btn { white-space: nowrap; width: auto; }
      .scd-workspace { padding: 1.25rem 1rem; }
      .scd-expand-grid { grid-template-columns: 1fr; }
      .scd-portfolio-grid { grid-template-columns: 1fr; }
      .scd-hero { padding: 2rem 1rem 1.5rem; }
      .scd-hero-inner { flex-direction: column; }
    }

    @media (max-width: 480px) {
      .scd-stats { gap: .5rem; }
      .scd-stat { padding: .875rem 1rem; min-width: 85px; }
    }
  `}</style>
);

export default function StudentClassDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("assignments");
  const [classData, setClassData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    link: "",
    project_title: "",
    project_description: "",
    github_link: "",
    demo_link: "",
  });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  useEffect(() => { fetchClassData(); }, [classId]);

  const fetchClassData = async () => {
    try {
      const [classRes, assignmentsRes, submissionsRes, attendanceRes, materialsRes] = await Promise.all([
        api.get(`/classes/${classId}`).catch(() => ({ data: null })),
        api.get(`/assignments/class/${classId}`).catch(() => ({ data: [] })),
        api.get(`/submissions/me`).catch(() => ({ data: [] })),
        api.get(`/attendance/me`).catch(() => ({ data: [] })),
        api.get(`/materials/class/${classId}`).catch(() => ({ data: [] })),
      ]);
      setClassData(classRes.data);
      setAssignments(assignmentsRes.data || []);
      const classSubmissions = (submissionsRes.data || []).filter((s: any) => s.assignment?.class_id === classId);
      setSubmissions(classSubmissions);
      setAttendance(attendanceRes.data?.filter((a: any) => a.class_id === classId) || []);
      setMaterials(materialsRes.data || []);
    } catch (err) {
      console.error("Fetch class data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, assignmentId: string, isFinal: boolean) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("assignment_id", assignmentId);
      if (isFinal) {
        if (!submissionForm.github_link) throw new Error("GitHub link is required for Final Project");
        formData.append("project_title", submissionForm.project_title);
        formData.append("project_description", submissionForm.project_description);
        formData.append("github_link", submissionForm.github_link);
        formData.append("demo_link", submissionForm.demo_link);
      } else {
        formData.append("submission_link", submissionForm.link);
      }
      if (submissionFile) formData.append("file", submissionFile);
      await api.post("/submissions/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Work turned in successfully!");
      setSubmissionForm({ link: "", project_title: "", project_description: "", github_link: "", demo_link: "" });
      setSubmissionFile(null);
      fetchClassData();
    } catch (err: any) {
      toast.error(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnsubmit = async (submissionId: string) => {
    if (!confirm("Are you sure you want to un-submit?")) return;
    try {
      await api.delete(`/submissions/${submissionId}`);
      toast.success("Submission retracted.");
      fetchClassData();
    } catch {
      toast.error("Retract failed.");
    }
  };

  /* ── Nav items ── */
  const tabs = [
    { id: "assignments", label: "Curriculum",       icon: FileText    },
    { id: "materials",   label: "Materials",         icon: Download    },
    { id: "submissions", label: "Submissions",       icon: CheckCircle },
    { id: "attendance",  label: "Attendance",        icon: Clock       },
    { id: "showcase",    label: "Portfolio",         icon: Layout      },
  ];

  const averageScore = submissions.length > 0
    ? submissions.reduce((acc, s) => acc + (parseInt(s.score) || 0), 0) / submissions.length
    : 0;

  const pendingAssignments = assignments.filter((a) => !submissions.find((s) => s.assignment_id === a.id));

  /* ── Loading ── */
  if (loading) return (
    <>
      <GlobalStyles />
      <div className="scd-loading">
        <div className="scd-spinner" />
        <p className="scd-loading-text">Initializing workspace…</p>
      </div>
    </>
  );

  /* ── Not found ── */
  if (!classData) return (
    <>
      <GlobalStyles />
      <div className="scd-loading">
        <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: ".75rem" }}>Environment Not Found</p>
        <Link href="/dashboard/student" className="scd-btn scd-btn-primary" style={{ textDecoration: "none" }}>
          Return to Dashboard
        </Link>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div className="scd-page">
        <Navbar />
        <main className="scd-main">

          {/* ── Hero ── */}
          <section className="scd-hero">
            <div className="scd-hero-inner">
              <div>
                <Link href="/dashboard/student" className="scd-back">
                  <ChevronLeft size={12} /> Back to Dashboard
                </Link>
                <h1 className="scd-class-name">{classData.class_name}</h1>
                <div className="scd-meta">
                  <span className="scd-track-badge">{classData.track?.toUpperCase()} Track</span>
                  <span className="scd-cycle-info"><Clock size={13} /> 8-Week Interactive Cycle</span>
                </div>
              </div>

              {/* Stats */}
              <div className="scd-stats">
                <div className="scd-stat">
                  <p className="scd-stat-label">Attendance</p>
                  <p className="scd-stat-value">{attendance.length}</p>
                  <p className="scd-stat-sub">Classes Attended</p>
                </div>
                <div className="scd-stat">
                  <p className="scd-stat-label">Total Tasks</p>
                  <p className="scd-stat-value">{assignments.length}</p>
                </div>
                <div className="scd-stat">
                  <p className="scd-stat-label">Avg Grade</p>
                  <p className="scd-stat-value blue">{averageScore.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="scd-body">

            {/* Sidebar */}
            <aside className="scd-sidebar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`scd-nav-btn${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="scd-nav-icon"><tab.icon size={15} /></span>
                  {tab.label}
                </button>
              ))}
            </aside>

            {/* Workspace */}
            <section className="scd-workspace">

              {/* ════ ASSIGNMENTS ════ */}
              {activeTab === "assignments" && (
                <>
                  <div className="scd-sec-header">
                    <div>
                      <h2 className="scd-sec-title">Curriculum Path</h2>
                      <p className="scd-sec-sub">Complete your upcoming tasks to advance.</p>
                    </div>
                  </div>

                  {pendingAssignments.length === 0 ? (
                    <div className="scd-empty">
                      <div className="scd-empty-icon"><Check size={22} /></div>
                      <p className="scd-empty-title">All tasks completed!</p>
                      <p className="scd-empty-sub">You're up to date with all module assignments.</p>
                    </div>
                  ) : (
                    pendingAssignments.map((assn: any) => {
                      const isFinal = assn.is_final_project == 1;
                      const isOpen = expandedId === assn.id;
                      return (
                        <div key={assn.id} className={`scd-assn-card${isFinal ? " final" : ""}`}>
                          {/* Header row */}
                          <div
                            className="scd-assn-header"
                            onClick={() => setExpandedId(isOpen ? null : assn.id)}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                              <div className={`scd-assn-icon${isFinal ? " final" : ""}`}>
                                <FileText size={18} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div className="scd-assn-name">
                                  {assn.title}
                                  {isFinal && <span className="scd-final-badge">Final</span>}
                                </div>
                                <p className="scd-assn-deadline">
                                  Deadline: {new Date(assn.deadline).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="scd-pending-badge">Pending</span>
                          </div>

                          {/* Expanded submission panel */}
                          {isOpen && (
                            <div className="scd-expand-panel">
                              <div className="scd-expand-grid">
                                {/* Task overview */}
                                <div>
                                  <p className="scd-task-label">Task Overview</p>
                                  <p className="scd-task-body">{assn.description}</p>
                                  {assn.file_url && (
                                    <Link
                                      href={`http://localhost:8000${assn.file_url}`}
                                      target="_blank"
                                      className="scd-btn scd-btn-ghost scd-btn-sm"
                                      style={{ marginTop: "1rem", textDecoration: "none" }}
                                    >
                                      <Download size={13} /> Download Resources
                                    </Link>
                                  )}
                                </div>

                                {/* Submission form */}
                                <form onSubmit={(e) => handleSubmit(e, assn.id, isFinal)} className="scd-sub-form">
                                  <p className="scd-sub-form-title">
                                    {isFinal ? "Launch Your Project" : "Submit Work"}
                                  </p>

                                  {isFinal ? (
                                    <>
                                      <input
                                        required
                                        className="scd-input"
                                        placeholder="Project Title"
                                        value={submissionForm.project_title}
                                        onChange={(e) => setSubmissionForm({ ...submissionForm, project_title: e.target.value })}
                                      />
                                      <input
                                        required
                                        className="scd-input"
                                        placeholder="GitHub Repository URL"
                                        value={submissionForm.github_link}
                                        onChange={(e) => setSubmissionForm({ ...submissionForm, github_link: e.target.value })}
                                      />
                                      <textarea
                                        required
                                        className="scd-textarea"
                                        placeholder="Deployment Link"
                                        rows={3}
                                        value={submissionForm.demo_link}
                                        onChange={(e) => setSubmissionForm({ ...submissionForm, demo_link: e.target.value })}
                                      />
                                      <textarea
                                        required
                                        className="scd-textarea"
                                        placeholder="Summary of tech stack and approach…"
                                        rows={3}
                                        value={submissionForm.project_description}
                                        onChange={(e) => setSubmissionForm({ ...submissionForm, project_description: e.target.value })}
                                      />
                                    </>
                                  ) : (
                                    <input
                                      className="scd-input"
                                      placeholder="GitHub / Website URL"
                                      value={submissionForm.link}
                                      onChange={(e) => setSubmissionForm({ ...submissionForm, link: e.target.value })}
                                    />
                                  )}

                                  {/* File upload */}
                                  <div>
                                    <input
                                      type="file"
                                      id={`sub-file-${assn.id}`}
                                      style={{ display: "none" }}
                                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                                    />
                                    <label
                                      htmlFor={`sub-file-${assn.id}`}
                                      className={`scd-file-zone${submissionFile ? " has-file" : ""}`}
                                    >
                                      <Upload size={13} />
                                      {submissionFile ? submissionFile.name : "Attach a file (optional)"}
                                    </label>
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={submitting}
                                    className="scd-btn scd-btn-primary"
                                    style={{ width: "100%" }}
                                  >
                                    {submitting ? "Processing…" : isFinal ? "Launch & Submit" : "Turn In"}
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* ════ SUBMISSIONS ════ */}
              {activeTab === "submissions" && (
                <>
                  <div className="scd-sec-header">
                    <div>
                      <h2 className="scd-sec-title">Academic Record</h2>
                      <p className="scd-sec-sub">Your submitted work and received grades.</p>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="scd-empty">
                      <div className="scd-empty-icon"><BarChart3 size={22} /></div>
                      <p className="scd-empty-title">No submissions yet</p>
                      <p className="scd-empty-sub">Complete and submit assignments to see your record here.</p>
                    </div>
                  ) : (
                    submissions.map((sub: any) => (
                      <div key={sub.id} className="scd-sub-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                          <div className="scd-sub-check"><CheckCircle size={18} /></div>
                          <div style={{ minWidth: 0 }}>
                            <p className="scd-sub-title">{sub.assignment?.title}</p>
                            <p className="scd-sub-date">Submitted {new Date(sub.submitted_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: ".65rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--s-gray-400)", marginBottom: ".35rem" }}>Score</p>
                            {sub.score != null
                              ? <span className="scd-score-pill">{sub.score} / 100</span>
                              : <span className="scd-ungraded">—</span>}
                          </div>
                          <div className="scd-divider-v" />
                          <button className="scd-icon-btn danger" onClick={() => handleUnsubmit(sub.id)} title="Retract submission">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ════ MATERIALS ════ */}
              {activeTab === "materials" && (
                <>
                  <div className="scd-sec-header">
                    <div>
                      <h2 className="scd-sec-title">Course Materials</h2>
                      <p className="scd-sec-sub">Learning resources uploaded by your instructor.</p>
                    </div>
                  </div>

                  {materials.length === 0 ? (
                    <div className="scd-empty">
                      <div className="scd-empty-icon"><FileText size={22} /></div>
                      <p className="scd-empty-title">No materials yet</p>
                      <p className="scd-empty-sub">Your instructor hasn't uploaded any resources yet.</p>
                    </div>
                  ) : (
                    materials.map((m: any) => (
                      <div key={m.id} className="scd-mat-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: ".3rem" }}>{m.title}</p>
                          <p style={{ fontSize: ".8rem", color: "var(--s-gray-500)", marginBottom: ".5rem" }}>{m.description}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                            <span className="scd-type-badge">{m.material_type}</span>
                            <span style={{ fontSize: ".72rem", color: "var(--s-gray-400)" }}>{new Date(m.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {m.file_url && (
                          <Link
                            href={`http://localhost:8000${m.file_url}`}
                            target="_blank"
                            download
                            className="scd-btn scd-btn-primary scd-btn-sm"
                            style={{ textDecoration: "none", flexShrink: 0 }}
                          >
                            <Download size={13} /> Download
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ════ ATTENDANCE ════ */}
              {activeTab === "attendance" && (
                <>
                  <div className="scd-sec-header">
                    <div>
                      <h2 className="scd-sec-title">Attendance Record</h2>
                      <p className="scd-sec-sub">Your presence log for this cycle.</p>
                    </div>
                  </div>

                  <div className="scd-attend-card">
                    <table className="scd-attend-table">
                      <thead>
                        <tr>
                          <th className="scd-attend-th">Date</th>
                          <th className="scd-attend-th">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length > 0 ? (
                          attendance.map((item) => (
                            <tr key={item.id} className="scd-attend-tr">
                              <td className="scd-attend-td">{new Date(item.date).toLocaleDateString()}</td>
                              <td className="scd-attend-td">
                                <span className={item.status === "present" ? "scd-status-present" : "scd-status-absent"}>
                                  {item.status === "present" ? "✓ Present" : "✗ Absent"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} style={{ padding: "3rem", textAlign: "center", color: "var(--s-gray-400)", fontSize: ".875rem" }}>
                              No attendance logs found for this cycle.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* ════ PORTFOLIO ════ */}
              {activeTab === "showcase" && (
                <>
                  <div className="scd-sec-header">
                    <div>
                      <h2 className="scd-sec-title">Showcase Portfolio</h2>
                      <p className="scd-sec-sub">Your final projects and published work.</p>
                    </div>
                  </div>

                  {submissions.filter((s) => s.assignment?.is_final_project == 1).length === 0 ? (
                    <div className="scd-empty">
                      <div className="scd-empty-icon"><Award size={22} /></div>
                      <p className="scd-empty-title">No projects yet</p>
                      <p className="scd-empty-sub">Submit your final project to see it showcased here.</p>
                    </div>
                  ) : (
                    <div className="scd-portfolio-grid">
                      {submissions
                        .filter((s) => s.assignment?.is_final_project == 1)
                        .map((sub) => (
                          <div key={sub.id} className="scd-portfolio-card">
                            <div style={{ display: "flex", alignItems: "flex-start", gap: ".875rem", marginBottom: "1rem" }}>
                              <div className="scd-port-avatar">{sub.student?.first_name?.[0] ?? "P"}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="scd-port-title">{sub.project_title}</p>
                                <p className="scd-port-sub">{sub.assignment?.title}</p>
                              </div>
                            </div>
                            <p className="scd-port-desc">{sub.project_description}</p>
                            <div style={{ display: "flex", gap: ".5rem" }}>
                              <Link href={sub.github_link || "#"} target="_blank" className="scd-btn scd-btn-ghost scd-btn-sm" style={{ textDecoration: "none" }}>
                                <LinkIcon size={13} /> GitHub
                              </Link>
                              <Link href={sub.demo_link || "#"} target="_blank" className="scd-btn scd-btn-primary scd-btn-sm" style={{ textDecoration: "none" }}>
                                <ExternalLink size={13} /> View Demo
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}

            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}