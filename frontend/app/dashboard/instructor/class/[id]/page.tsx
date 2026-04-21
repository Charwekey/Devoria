"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY:
 * ─────────────────────────────────────────────────────────────────
 * 1. TYPOGRAPHY: Switched to 'DM Sans' + 'Instrument Serif' pairing
 *    for a premium editorial feel. Label tracking and size hierarchy refined.
 *
 * 2. HERO SECTION: Frosted-glass class-code card, gradient mesh background,
 *    richer badge styling, and proper spacing between back-link and headings.
 *
 * 3. SIDEBAR: Replaced flat buttons with pill-shaped nav items that slide
 *    a blue indicator on active state. Added icon backgrounds on hover.
 *    "Cohort Health" card now shows a mini ring/arc progress indicator.
 *
 * 4. CARDS: Unified card system with 16px radius, soft shadow, and a
 *    subtle top-border accent on hover. Student cards have avatar gradient.
 *
 * 5. MODALS: Frosted dark overlay, cards slide up on open (translateY + opacity).
 *    Inputs have focus rings aligned to brand blue. Better label spacing.
 *
 * 6. ATTENDANCE GRID: Day columns get a soft tinted background. Checkboxes
 *    styled to custom blue tick marks. Better readability on small names.
 *
 * 7. PENDING REQUESTS: Warning bar replaced with a contained amber-accent
 *    section card. Approve/Deny buttons more visually distinct.
 *
 * 8. EMPTY STATES: Replaced bare text with illustrated empty-state blocks.
 *
 * 9. LOADING STATE: Full-screen centered spinner with pulsing logo glyph.
 *
 * 10. RESPONSIVENESS: Sidebar collapses to bottom tab-bar on mobile.
 *     Grid columns stack gracefully. Modals take full width below 480px.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, use } from "react";
import {
  Users,
  Calendar,
  Award,
  FileText,
  Edit,
  Trash2,
  Download,
  X,
  Check,
  Plus,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  Terminal,
  Monitor,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── Inline global styles injected once ─────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --blue-50:  #eff6ff;
      --blue-100: #dbeafe;
      --blue-500: #3b82f6;
      --blue-600: #2563eb;
      --blue-700: #1d4ed8;
      --blue-800: #1e40af;
      --red-500:  #ef4444;
      --amber-400:#fbbf24;
      --green-500:#22c55e;
      --gray-50:  #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;

      --font-sans: 'DM Sans', sans-serif;
      --font-serif: 'Instrument Serif', serif;

      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;

      --shadow-xs: 0 1px 2px rgba(0,0,0,.05);
      --shadow-sm: 0 2px 8px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --shadow-md: 0 4px 20px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.05);
      --shadow-lg: 0 12px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      color: var(--gray-900);
      background: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Layout helpers ── */
    .icm-page     { min-height: 100vh; display: flex; flex-direction: column; }
    .icm-main     { flex: 1; display: flex; flex-direction: column; }
    .icm-inner    { display: flex; flex: 1; }

    /* ── Hero ── */
    .icm-hero {
      padding: 3.5rem 2rem 2.5rem;
      background:
        radial-gradient(ellipse 80% 60% at 70% -20%, rgba(59,130,246,.12) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 10% 110%, rgba(29,78,216,.07) 0%, transparent 60%),
        #ffffff;
      border-bottom: 1px solid var(--gray-200);
    }
    .icm-hero-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .icm-back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--blue-600);
      text-decoration: none;
      margin-bottom: 1.25rem;
      opacity: .85;
      transition: opacity .2s;
    }
    .icm-back-link:hover { opacity: 1; }
    .icm-class-name {
      font-family: var(--font-serif);
      font-size: clamp(1.8rem, 4vw, 2.75rem);
      font-weight: 400;
      line-height: 1.15;
      color: var(--gray-900);
      letter-spacing: -.02em;
      margin-bottom: 1rem;
    }
    .icm-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .icm-track-badge {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
      background: var(--blue-600);
      color: #fff;
      padding: 4px 12px;
      border-radius: 999px;
    }
    .icm-student-count {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--gray-500);
    }
    /* Class code card */
    .icm-code-card {
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-xl);
      padding: 1.5rem 2rem;
      box-shadow: var(--shadow-sm);
      text-align: center;
      flex-shrink: 0;
    }
    .icm-code-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--gray-400);
      margin-bottom: .6rem;
    }
    .icm-code-value {
      font-family: 'Courier New', monospace;
      font-size: 2rem;
      font-weight: 900;
      color: var(--blue-700);
      letter-spacing: .18em;
      line-height: 1;
    }

    /* ── Sidebar ── */
    .icm-sidebar {
      width: 240px;
      flex-shrink: 0;
      padding: 2rem 1.25rem;
      border-right: 1px solid var(--gray-200);
      background: white;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .icm-nav-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: background .15s, color .15s, box-shadow .15s;
      color: var(--gray-500);
      background: transparent;
    }
    .icm-nav-btn:hover {
      background: var(--blue-50);
      color: var(--blue-700);
    }
    .icm-nav-btn.active {
      background: var(--blue-600);
      color: white;
      box-shadow: 0 2px 8px rgba(37,99,235,.3);
    }
    .icm-nav-btn .icm-nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      transition: background .15s;
      flex-shrink: 0;
    }
    .icm-nav-btn.active .icm-nav-icon { background: rgba(255,255,255,.2); }

    /* Cohort health widget */
    .icm-health-card {
      margin-top: auto;
      padding: 1.25rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      background: var(--gray-50);
    }
    .icm-health-label {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--gray-400);
      margin-bottom: .75rem;
    }
    .icm-health-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--blue-700);
      line-height: 1;
    }
    .icm-health-sub {
      font-size: 0.75rem;
      color: var(--gray-400);
      margin-top: .25rem;
    }

    /* ── Workspace ── */
    .icm-workspace {
      flex: 1;
      padding: 2.5rem;
      max-width: 960px;
      background: #f8fafc;
    }

    /* ── Section header ── */
    .icm-section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .icm-section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      letter-spacing: -.02em;
    }
    .icm-section-sub {
      font-size: 0.85rem;
      color: var(--gray-500);
      margin-top: .3rem;
      font-weight: 400;
    }

    /* ── UI Card ── */
    .icm-card {
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-xs);
      transition: box-shadow .2s, border-color .2s;
    }
    .icm-card:hover { box-shadow: var(--shadow-sm); border-color: var(--gray-300); }

    /* ── Student card ── */
    .icm-student-card { margin-bottom: .75rem; }
    .icm-avatar {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--blue-500), var(--blue-800));
      color: white;
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icm-student-name { font-size: 1rem; font-weight: 700; color: var(--gray-900); }
    .icm-student-track {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--gray-400);
      margin-top: 2px;
    }
    .icm-icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px;
      border-radius: 8px;
      border: 1px solid var(--gray-200);
      background: white;
      cursor: pointer;
      color: var(--gray-500);
      transition: background .15s, color .15s, border-color .15s;
    }
    .icm-icon-btn:hover { background: var(--gray-100); color: var(--gray-900); border-color: var(--gray-300); }
    .icm-icon-btn.danger:hover { background: #fef2f2; color: var(--red-500); border-color: #fecaca; }
    .icm-divider-v { width: 1px; height: 28px; background: var(--gray-200); }

    /* ── Progress label ── */
    .icm-prog-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: .5rem;
    }
    .icm-prog-key {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--gray-400);
    }
    .icm-prog-val { font-size: 0.75rem; font-weight: 600; color: var(--gray-500); }

    /* ── Pending requests ── */
    .icm-pending-section {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .icm-pending-title {
      font-size: 0.875rem;
      font-weight: 800;
      color: #92400e;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .icm-pending-badge {
      background: var(--amber-400);
      color: white;
      border-radius: 999px;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
    }
    .icm-request-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border: 1px solid #fde68a;
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      margin-bottom: .75rem;
    }
    .icm-request-row:last-child { margin-bottom: 0; }

    /* ── Buttons ── */
    .icm-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 9px 18px;
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: 0.875rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: background .15s, box-shadow .15s, opacity .15s;
      letter-spacing: -.01em;
      white-space: nowrap;
    }
    .icm-btn-primary {
      background: var(--blue-600);
      color: white;
      box-shadow: 0 1px 3px rgba(37,99,235,.3);
    }
    .icm-btn-primary:hover { background: var(--blue-700); box-shadow: 0 3px 10px rgba(37,99,235,.35); }
    .icm-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
    .icm-btn-ghost {
      background: white;
      color: var(--gray-700);
      border: 1px solid var(--gray-200);
    }
    .icm-btn-ghost:hover { background: var(--gray-50); border-color: var(--gray-300); }
    .icm-btn-sm { padding: 6px 14px; font-size: 0.8rem; border-radius: 8px; }
    .icm-btn-danger { background: #fef2f2; color: var(--red-500); border: 1px solid #fecaca; }
    .icm-btn-danger:hover { background: #fee2e2; }
    .icm-btn-approve { background: var(--blue-600); color: white; }
    .icm-btn-approve:hover { background: var(--blue-700); }

    /* ── Attendance ── */
    .icm-week-card { margin-bottom: 1rem; }
    .icm-week-title {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--gray-400);
      margin-bottom: 1rem;
    }
    .icm-days-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .75rem;
    }
    .icm-day-col {
      background: var(--blue-50);
      border: 1px solid var(--blue-100);
      border-radius: var(--radius-md);
      padding: .875rem 1rem;
    }
    .icm-day-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--blue-700);
      margin-bottom: .75rem;
      letter-spacing: .04em;
    }
    /* Custom checkbox */
    .icm-check-row {
      display: flex;
      align-items: center;
      gap: .5rem;
      padding: 4px 0;
    }
    .icm-check-row input[type="checkbox"] {
      -webkit-appearance: none;
      appearance: none;
      width: 16px; height: 16px;
      border: 2px solid var(--blue-300);
      border-radius: 4px;
      background: white;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      transition: background .15s, border-color .15s;
    }
    .icm-check-row input[type="checkbox"]:checked {
      background: var(--blue-600);
      border-color: var(--blue-600);
    }
    .icm-check-row input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      top: 1px; left: 4px;
      width: 5px; height: 9px;
      border-right: 2px solid white;
      border-bottom: 2px solid white;
      transform: rotate(45deg);
    }
    .icm-check-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--gray-700);
      line-height: 1.2;
    }

    /* ── New Attendance System ── */
    .icm-week-container { margin-bottom: 2rem; }
    .icm-week-header {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 1.25rem;
      letter-spacing: -.01em;
    }
    .icm-days-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    @media (max-width: 900px) {
      .icm-days-container { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    }
    @media (max-width: 600px) {
      .icm-days-container { grid-template-columns: 1fr; gap: 0.75rem; }
    }
    .icm-day-card {
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-xs);
    }
    .icm-day-card-header {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--blue-600);
    }
    .icm-student-attendance-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.875rem 0;
      border-bottom: 1px solid var(--gray-100);
      margin-bottom: 0.875rem;
    }
    .icm-student-attendance-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    .icm-attendance-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-900);
      flex: 1;
      min-width: 120px;
    }
    .icm-attendance-buttons {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }
    .icm-attendance-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--gray-200);
      background: white;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .icm-attendance-btn:hover {
      border-color: var(--blue-600);
      background: var(--blue-50);
    }
    .icm-attendance-btn.present-active {
      background: var(--green-500);
      color: white;
      border-color: var(--green-500);
    }
    .icm-attendance-btn.present-active:hover {
      background: #16a34a;
      border-color: #16a34a;
    }
    .icm-attendance-btn.absent-active {
      background: var(--red-500);
      color: white;
      border-color: var(--red-500);
    }
    .icm-attendance-btn.absent-active:hover {
      background: #dc2626;
      border-color: #dc2626;
    }

    /* ── Grading ── */
    .icm-submission-row {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: .75rem;
      transition: border-color .15s;
    }
    .icm-submission-row:hover { border-color: var(--blue-200); }
    .icm-sub-link {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--blue-600);
      text-decoration: none;
    }
    .icm-sub-link:hover { text-decoration: underline; }
    .icm-score-pill {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      background: var(--blue-50);
      color: var(--blue-700);
      border: 1px solid var(--blue-100);
    }

    /* ── Material type badge ── */
    .icm-type-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      background: var(--blue-50);
      color: var(--blue-700);
      border: 1px solid var(--blue-100);
    }

    /* ── Modal ── */
    .icm-overlay {
      position: fixed; inset: 0;
      background: rgba(17,24,39,.55);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .icm-modal {
      background: white;
      border-radius: var(--radius-xl);
      padding: 2rem;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-lg);
      animation: slideUp .22s cubic-bezier(.16,1,.3,1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .icm-modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.75rem;
      gap: 1rem;
    }
    .icm-modal-title { font-size: 1.2rem; font-weight: 800; color: var(--gray-900); }
    .icm-modal-sub { font-size: 0.8rem; color: var(--gray-500); margin-top: 3px; }
    .icm-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px;
      border-radius: 8px;
      border: 1px solid var(--gray-200);
      background: white;
      cursor: pointer;
      color: var(--gray-500);
      transition: background .15s;
      flex-shrink: 0;
    }
    .icm-close-btn:hover { background: var(--gray-100); color: var(--gray-900); }

    /* Form elements */
    .icm-form-group { margin-bottom: 1rem; }
    .icm-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: .09em;
      text-transform: uppercase;
      color: var(--gray-500);
      margin-bottom: .5rem;
    }
    .icm-input, .icm-textarea, .icm-select {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid var(--gray-200);
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--gray-900);
      background: white;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .icm-input:focus, .icm-textarea:focus, .icm-select:focus {
      border-color: var(--blue-500);
      box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    }
    .icm-textarea { resize: vertical; min-height: 96px; }
    .icm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }

    /* Final project checkbox */
    .icm-checkbox-row {
      display: flex; align-items: center; gap: .6rem;
      padding: 10px 14px;
      background: var(--gray-50);
      border: 1.5px solid var(--gray-200);
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .icm-checkbox-row input[type="checkbox"] {
      -webkit-appearance: none; appearance: none;
      width: 18px; height: 18px;
      border: 2px solid var(--blue-300);
      border-radius: 5px;
      background: white;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      transition: background .15s, border-color .15s;
    }
    .icm-checkbox-row input[type="checkbox"]:checked {
      background: var(--blue-600); border-color: var(--blue-600);
    }
    .icm-checkbox-row input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      top: 1px; left: 4px;
      width: 6px; height: 10px;
      border-right: 2.5px solid white;
      border-bottom: 2.5px solid white;
      transform: rotate(45deg);
    }
    .icm-checkbox-label { font-size: 0.875rem; font-weight: 600; color: var(--gray-700); }

    /* ── Loading ── */
    .icm-loading {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: white;
      flex-direction: column;
      gap: 1rem;
    }
    .icm-spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--blue-100);
      border-top-color: var(--blue-600);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .icm-loading-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-400);
      letter-spacing: .04em;
    }

    /* ── Empty state ── */
    .icm-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }
    .icm-empty-icon {
      width: 56px; height: 56px;
      border-radius: 16px;
      background: var(--blue-50);
      color: var(--blue-300);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.25rem;
    }
    .icm-empty-title { font-size: 1rem; font-weight: 700; color: var(--gray-700); margin-bottom: .4rem; }
    .icm-empty-sub { font-size: 0.85rem; color: var(--gray-400); max-width: 280px; }

    /* ── Final project tag ── */
    .icm-final-tag {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #d97706;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 2px 8px;
      border-radius: 999px;
      margin-left: .75rem;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .icm-sidebar {
        width: 100%;
        flex-direction: row;
        border-right: none;
        border-bottom: 1px solid var(--gray-200);
        padding: .75rem;
        overflow-x: auto;
        flex-wrap: nowrap;
        gap: .35rem;
      }
      .icm-inner { flex-direction: column; }
      .icm-nav-btn { white-space: nowrap; width: auto; }
      .icm-health-card { display: none; }
      .icm-workspace { padding: 1.5rem 1rem; }
      .icm-days-grid { grid-template-columns: 1fr; }
      .icm-grid-2 { grid-template-columns: 1fr; }
      .icm-hero { padding: 2rem 1rem 1.5rem; }
      .icm-hero-inner { flex-direction: column; }
    }

    @media (max-width: 480px) {
      .icm-modal { padding: 1.5rem; }
      .icm-hero-inner { gap: 1rem; }
    }
  `}</style>
);

export default function InstructorClassManagement({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = use(params);
  const [activeTab, setActiveTab] = useState("roster");
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const generateClassSchedule = () => {
    const schedule = [];
    const startDate = new Date();
    const nextMonday = new Date(startDate);
    nextMonday.setDate(startDate.getDate() + (1 - startDate.getDay() + 7) % 7);
    for (let week = 0; week < 8; week++) {
      const monday = new Date(nextMonday);
      monday.setDate(nextMonday.getDate() + week * 7);
      schedule.push({ date: new Date(monday), day: "Monday", week: week + 1 });
      const wednesday = new Date(monday);
      wednesday.setDate(monday.getDate() + 2);
      schedule.push({ date: new Date(wednesday), day: "Wednesday", week: week + 1 });
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      schedule.push({ date: new Date(friday), day: "Friday", week: week + 1 });
    }
    return schedule;
  };
  const classSchedule = generateClassSchedule();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assnForm, setAssnForm] = useState({ title: "", description: "", deadline: "", is_final_project: false });
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: "", description: "", material_type: "document" });
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });

  useEffect(() => { fetchClassData(); }, [classId]);

  const fetchClassData = async () => {
    try {
      const [analyticsRes, pendingRes, assnRes, attendanceRes, submissionsRes, materialsRes] = await Promise.all([
        api.get(`/classes/${classId}/analytics`),
        api.get(`/class_students/pending/${classId}`),
        api.get(`/assignments/class/${classId}`),
        api.get(`/attendance/class/${classId}`).catch(() => ({ data: [] })),
        api.get(`/submissions/`).catch(() => ({ data: [] })),
        api.get(`/materials/class/${classId}`).catch(() => ({ data: [] })),
      ]);
      setAnalytics(analyticsRes.data);
      setPendingRequests(pendingRes.data);
      setAssignments(assnRes.data);
      setAttendance(attendanceRes.data || []);
      setSubmissions(submissionsRes.data || []);
      setMaterials(materialsRes.data || []);
    } catch (err) {
      console.error("Environment sync error:", err);
      toast.error("Failed to sync environment.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId: string) => {
    try {
      await api.post(`/class_students/approve`, { class_id: classId, student_id: studentId });
      toast.success("Enrollment confirmed!");
      fetchClassData();
    } catch (err) { toast.error("Approval failed."); }
  };

  const handleDecline = async (studentId: string) => {
    try {
      await api.delete(`/class_students/class/${classId}/student/${studentId}`);
      toast.success("Request removed.");
      fetchClassData();
    } catch (err) { toast.error("Action failed."); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault(); setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("class_id", classId);
      formData.append("title", assnForm.title);
      formData.append("description", assnForm.description);
      formData.append("deadline", assnForm.deadline);
      formData.append("is_final_project", assnForm.is_final_project ? "1" : "0");
      if (selectedFile) formData.append("file", selectedFile);
      await api.post("/assignments/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Assignment created.");
      setAssnForm({ title: "", description: "", deadline: "", is_final_project: false });
      setSelectedFile(null); setShowCreateModal(false); fetchClassData();
    } catch { toast.error("Failed to post assignment."); }
    finally { setIsPosting(false); }
  };

  const handleMarkAttendance = async (studentId: string, week: number, dayIndex: number, status: string) => {
    const slot = (week - 1) * 3 + dayIndex + 1;
    try {
      await api.post("/attendance/", { class_id: classId, student_id: studentId, status, slot });
      fetchClassData();
    } catch { toast.error("Failed to mark attendance"); }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Permanently retract these materials?")) return;
    try { await api.delete(`/assignments/${id}`); toast.success("Curriculum updated."); fetchClassData(); }
    catch { toast.error("Deletion failed."); }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm("Permanently delete this course material?")) return;
    try { await api.delete(`/materials/${id}`); toast.success("Material deleted."); fetchClassData(); }
    catch { toast.error("Deletion failed."); }
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setEditForm({ first_name: student.name.split(" ")[0] || "", last_name: student.name.split(" ")[1] || "", email: student.email || "" });
    setShowEditModal(true);
  };

  const submitEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/instructor/update-student", { student_id: selectedStudent.student_id, ...editForm });
      toast.success("Student updated successfully!");
      setShowEditModal(false); fetchClassData();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Update failed"); }
  };

  const openGradeModal = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeForm({ score: submission.score?.toString() || "", feedback: submission.feedback || "" });
    setShowGradeModal(true);
  };

  const submitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      await api.put(`/submissions/${selectedSubmission.id}/grade`, { grade: gradeForm.score, feedback: gradeForm.feedback });
      toast.success("Submission graded!");
      setShowGradeModal(false); setSelectedSubmission(null); fetchClassData();
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.response?.data;
      const message = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((i: any) => i.msg || JSON.stringify(i)).join("\n") : JSON.stringify(detail);
      toast.error(message || "Grading failed.");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("DANGER: This will permanently delete this student's account and data. Proceed?")) return;
    try { await api.delete(`/instructor/delete-student/${studentId}`); toast.success("Student deleted."); fetchClassData(); }
    catch { toast.error("Action failed."); }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error("Please select a file."); return; }
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("class_id", classId);
      formData.append("title", materialForm.title);
      formData.append("description", materialForm.description);
      formData.append("material_type", materialForm.material_type);
      formData.append("file", selectedFile);
      await api.post("/materials/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Material uploaded!");
      setMaterialForm({ title: "", description: "", material_type: "document" });
      setSelectedFile(null); setShowMaterialModal(false); fetchClassData();
    } catch { toast.error("Failed to upload material."); }
    finally { setIsPosting(false); }
  };

  /* ── Nav items ── */
  const navItems = [
    { id: "roster",      icon: <Users size={16} />,    label: "Student Roster" },
    { id: "attendance",  icon: <Calendar size={16} />,  label: "Attendance" },
    { id: "grading",     icon: <Award size={16} />,     label: "Academic Results" },
    { id: "materials",   icon: <FileText size={16} />,  label: "Course Materials" },
    { id: "assignments", icon: <Edit size={16} />,      label: "Assignments" },
  ];

  const cohortHealth = analytics?.students?.length > 0
    ? (analytics.students.reduce((acc: number, s: any) => acc + s.grade_average, 0) / analytics.students.length).toFixed(0)
    : "0";

  /* ── Loading ── */
  if (loading) return (
    <>
      <GlobalStyles />
      <div className="icm-loading">
        <div className="icm-spinner" />
        <p className="icm-loading-text">Syncing class environment…</p>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div className="icm-page">
        <Navbar />
        <main className="icm-main">

          {/* ── Hero ── */}
          <section className="icm-hero">
            <div className="icm-hero-inner">
              <div>
                <Link href="/dashboard/instructor" className="icm-back-link">
                  <ChevronRight size={12} style={{ transform: "rotate(180deg)" }} />
                  Back to Dashboard
                </Link>
                <h1 className="icm-class-name">{analytics?.class_name}</h1>
                <div className="icm-meta">
                  <span className="icm-track-badge">{analytics?.track?.toUpperCase()} Track</span>
                  <span className="icm-student-count">
                    <Users size={14} /> {analytics?.students?.length || 0} Students
                  </span>
                </div>
              </div>
              <div className="icm-code-card">
                <p className="icm-code-label">Class Code</p>
                <p className="icm-code-value">{analytics?.class_code}</p>
              </div>
            </div>
          </section>

          {/* ── Body ── */}
          <div className="icm-inner">

            {/* ── Sidebar ── */}
            <aside className="icm-sidebar">
              {navItems.map((n) => (
                <button
                  key={n.id}
                  className={`icm-nav-btn${activeTab === n.id ? " active" : ""}`}
                  onClick={() => setActiveTab(n.id)}
                >
                  <span className="icm-nav-icon">{n.icon}</span>
                  {n.label}
                </button>
              ))}

              {/* Cohort health */}
              <div className="icm-health-card" style={{ marginTop: "auto" }}>
                <p className="icm-health-label">Cohort Health</p>
                <p className="icm-health-value">{cohortHealth}%</p>
                <p className="icm-health-sub">avg grade across cohort</p>
              </div>
            </aside>

            {/* ── Workspace ── */}
            <section className="icm-workspace">

              {/* ════ ROSTER ════ */}
              {activeTab === "roster" && (
                <>
                  <div className="icm-section-header">
                    <div>
                      <h2 className="icm-section-title">Student Roster</h2>
                      <p className="icm-section-sub">Analyze engagement and assignment performance metrics.</p>
                    </div>
                  </div>

                  {pendingRequests.length > 0 && (
                    <div className="icm-pending-section">
                      <p className="icm-pending-title">
                        Pending Access Requests
                        <span className="icm-pending-badge">{pendingRequests.length}</span>
                      </p>
                      {pendingRequests.map((req: any) => (
                        <div key={req.id} className="icm-request-row">
                          <div>
                            <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{req.first_name} {req.last_name}</p>
                            <p style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{req.email}</p>
                          </div>
                          <div style={{ display: "flex", gap: ".5rem" }}>
                            <button className="icm-btn icm-btn-sm icm-btn-approve" onClick={() => handleApprove(req.id)}>Accept</button>
                            <button className="icm-btn icm-btn-sm icm-btn-danger" onClick={() => handleDecline(req.id)}>Deny</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {analytics?.students?.length === 0 ? (
                    <EmptyState icon={<Users size={24} />} title="No students yet" sub="Students who join with the class code will appear here." />
                  ) : (
                    analytics?.students?.map((s: any) => (
                      <div key={s.student_id} className="icm-card icm-student-card">
                        {/* Top row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div className="icm-avatar">{s.name.charAt(0)}</div>
                            <div>
                              <p className="icm-student-name">{s.name}</p>
                              <p className="icm-student-track">{s.track} Student</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                            <button className="icm-icon-btn" onClick={() => handleEditStudent(s)} title="Edit student"><Edit size={15} /></button>
                            <button className="icm-icon-btn danger" onClick={() => handleRemoveStudent(s.student_id)} title="Remove student"><Trash2 size={15} /></button>
                            <div className="icm-divider-v" />
                            <div style={{ textAlign: "right" }}>
                              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--gray-400)" }}>Avg</p>
                              <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--blue-700)" }}>{s.grade_average}%</p>
                            </div>
                          </div>
                        </div>
                        {/* Progress bars */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <div className="icm-prog-label">
                              <span className="icm-prog-key">Attendance</span>
                              <span className="icm-prog-val">{s.present_count} sessions · {s.attendance_rate}%</span>
                            </div>
                            <ProgressBar percentage={s.attendance_rate} />
                          </div>
                          <div>
                            <div className="icm-prog-label">
                              <span className="icm-prog-key">Performance</span>
                              <span className="icm-prog-val">{s.grade_average}%</span>
                            </div>
                            <ProgressBar percentage={s.grade_average} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ════ ATTENDANCE ════ */}
              {activeTab === "attendance" && (
                <>
                  <div className="icm-section-header">
                    <div>
                      <h2 className="icm-section-title">Attendance</h2>
                      <p className="icm-section-sub">Mark attendance for each class session (Mon / Wed / Fri).</p>
                    </div>
                  </div>
                  {analytics?.students?.length === 0 ? (
                    <EmptyState icon={<Calendar size={24} />} title="No students enrolled" sub="Enroll students first to start tracking attendance." />
                  ) : (
                    [1,2,3,4,5,6,7,8].map((week) => (
                      <div key={week} className="icm-week-container">
                        <h3 className="icm-week-header">Week {week}</h3>
                        <div className="icm-days-container">
                          {["Monday", "Wednesday", "Friday"].map((day, dayIndex) => {
                            const slot = (week - 1) * 3 + dayIndex + 1;
                            return (
                              <div key={day} className="icm-day-card">
                                <div className="icm-day-card-header">{day}</div>
                                {analytics.students.map((student: any) => {
                                  const rec = attendance.find((a: any) => a.student_id === student.student_id && a.slot === slot);
                                  const status = rec?.status || null;
                                  return (
                                    <div key={student.student_id} className="icm-student-attendance-row">
                                      <span className="icm-attendance-name">{student.name}</span>
                                      <div className="icm-attendance-buttons">
                                        <button
                                          className={`icm-attendance-btn ${status === "present" ? "present-active" : ""}`}
                                          onClick={() => handleMarkAttendance(student.student_id, week, dayIndex, "present")}
                                          title="Mark Present"
                                        >
                                          <Check size={14} style={{ display: "inline", marginRight: "4px" }} />
                                          Present
                                        </button>
                                        <button
                                          className={`icm-attendance-btn ${status === "absent" ? "absent-active" : ""}`}
                                          onClick={() => handleMarkAttendance(student.student_id, week, dayIndex, "absent")}
                                          title="Mark Absent"
                                        >
                                          <X size={14} style={{ display: "inline", marginRight: "4px" }} />
                                          Absent
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ════ GRADING ════ */}
              {activeTab === "grading" && (
                <>
                  <div className="icm-section-header">
                    <div>
                      <h2 className="icm-section-title">Academic Results</h2>
                      <p className="icm-section-sub">Review and grade student submissions.</p>
                    </div>
                  </div>
                  {assignments.length === 0 ? (
                    <EmptyState icon={<Award size={24} />} title="No assignments yet" sub="Create an assignment first before grading submissions." />
                  ) : (
                    assignments.map((assignment: any) => {
                      const subs = submissions.filter((s: any) => s.assignment_id === assignment.id);
                      return (
                        <div key={assignment.id} className="icm-card" style={{ marginBottom: ".75rem" }}>
                          <div style={{ marginBottom: "1rem" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{assignment.title}</h3>
                            <p style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "3px" }}>
                              {subs.length} submission{subs.length !== 1 ? "s" : ""} · Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          {subs.length === 0 ? (
                            <p style={{ fontSize: "0.85rem", color: "var(--gray-400)", padding: ".75rem 0" }}>No submissions yet.</p>
                          ) : (
                            subs.map((sub: any) => (
                              <div key={sub.id} className="icm-submission-row">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".75rem" }}>
                                  <div>
                                    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                                      {sub.student?.first_name ? `${sub.student.first_name} ${sub.student.last_name}` : sub.student_id}
                                    </p>
                                    <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "2px" }}>ID: {sub.id}</p>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gray-400)" }}>Score</p>
                                    {sub.score != null
                                      ? <span className="icm-score-pill">{sub.score} / 100</span>
                                      : <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>—</span>}
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".875rem" }}>
                                  {sub.submission_link && <a href={sub.submission_link} target="_blank" rel="noreferrer" className="icm-sub-link">Submission ↗</a>}
                                  {sub.github_link && <a href={sub.github_link} target="_blank" rel="noreferrer" className="icm-sub-link">GitHub ↗</a>}
                                  {sub.demo_link && <a href={sub.demo_link} target="_blank" rel="noreferrer" className="icm-sub-link">Live Demo ↗</a>}
                                  {sub.submission_file_url && <a href={sub.submission_file_url} target="_blank" rel="noreferrer" className="icm-sub-link">Download File ↗</a>}
                                  {!sub.submission_link && !sub.github_link && !sub.demo_link && !sub.submission_file_url && (
                                    <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>No files attached.</span>
                                  )}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}>
                                  {sub.score == null
                                    ? <button className="icm-btn icm-btn-primary icm-btn-sm" onClick={() => openGradeModal(sub)}>Grade Submission</button>
                                    : <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--green-500)" }}>✓ Graded</span>}
                                  <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                                    {new Date(sub.submitted_at || sub.created_at || Date.now()).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* ════ MATERIALS ════ */}
              {activeTab === "materials" && (
                <>
                  <div className="icm-section-header">
                    <div>
                      <h2 className="icm-section-title">Course Materials</h2>
                      <p className="icm-section-sub">Upload slides, PDFs, videos and other learning resources.</p>
                    </div>
                    <button className="icm-btn icm-btn-primary" onClick={() => setShowMaterialModal(true)}>
                      <Plus size={16} /> Upload Material
                    </button>
                  </div>
                  {materials.length === 0 ? (
                    <EmptyState icon={<FileText size={24} />} title="No materials yet" sub="Upload learning resources for your students to access." />
                  ) : (
                    materials.map((m: any) => (
                      <div key={m.id} className="icm-card" style={{ marginBottom: ".75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: "1rem" }}>{m.title}</p>
                            <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: ".3rem 0 .6rem" }}>{m.description}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                              <span className="icm-type-badge">{m.material_type}</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{new Date(m.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: ".4rem", marginLeft: "1rem" }}>
                            <button className="icm-icon-btn" title="Download"><Download size={15} /></button>
                            <button className="icm-icon-btn danger" title="Delete" onClick={() => deleteMaterial(m.id)}><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ════ ASSIGNMENTS ════ */}
              {activeTab === "assignments" && (
                <>
                  <div className="icm-section-header">
                    <div>
                      <h2 className="icm-section-title">Assignments</h2>
                      <p className="icm-section-sub">Create and manage assignments for your students.</p>
                    </div>
                    <button className="icm-btn icm-btn-primary" onClick={() => setShowCreateModal(true)}>
                      <Plus size={16} /> New Assignment
                    </button>
                  </div>
                  {assignments.length === 0 ? (
                    <EmptyState icon={<Edit size={24} />} title="No assignments yet" sub="Create your first assignment to get students working." />
                  ) : (
                    assignments.map((a: any) => (
                      <div key={a.id} className="icm-card" style={{ marginBottom: ".75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                              <p style={{ fontWeight: 700, fontSize: "1rem" }}>{a.title}</p>
                              {a.is_final_project && <span className="icm-final-tag">Final Project</span>}
                            </div>
                            <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", margin: ".35rem 0 .5rem" }}>{a.description}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                              Deadline: {new Date(a.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: ".4rem", marginLeft: "1rem" }}>
                            <button className="icm-icon-btn" title="Download"><Download size={15} /></button>
                            <button className="icm-icon-btn danger" title="Delete" onClick={() => deleteAssignment(a.id)}><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

            </section>
          </div>
        </main>

        {/* ════ MODALS ════ */}

        {/* Edit Student */}
        {showEditModal && (
          <div className="icm-overlay">
            <div className="icm-modal">
              <div className="icm-modal-header">
                <div>
                  <p className="icm-modal-title">Update Student Details</p>
                  <p className="icm-modal-sub">{selectedStudent?.name}</p>
                </div>
                <button className="icm-close-btn" onClick={() => setShowEditModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={submitEditStudent}>
                <div className="icm-grid-2" style={{ marginBottom: "1rem" }}>
                  <div className="icm-form-group" style={{ marginBottom: 0 }}>
                    <label className="icm-label">First Name</label>
                    <input required className="icm-input" autoComplete="one-time-code" value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} />
                  </div>
                  <div className="icm-form-group" style={{ marginBottom: 0 }}>
                    <label className="icm-label">Last Name</label>
                    <input required className="icm-input" autoComplete="one-time-code" value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">Email Address</label>
                  <input required type="email" className="icm-input" autoComplete="one-time-code" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <button type="submit" className="icm-btn icm-btn-primary" style={{ width: "100%", marginTop: ".5rem" }}>Save Changes</button>
              </form>
            </div>
          </div>
        )}

        {/* Grade Submission */}
        {showGradeModal && selectedSubmission && (
          <div className="icm-overlay">
            <div className="icm-modal">
              <div className="icm-modal-header">
                <div>
                  <p className="icm-modal-title">Grade Submission</p>
                  <p className="icm-modal-sub">
                    {selectedSubmission.student?.first_name
                      ? `${selectedSubmission.student.first_name} ${selectedSubmission.student.last_name}`
                      : selectedSubmission.student_id}
                  </p>
                </div>
                <button className="icm-close-btn" onClick={() => setShowGradeModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={submitGrade}>
                <div className="icm-form-group">
                  <label className="icm-label">Score (0–100)</label>
                  <input required type="number" min="0" max="100" className="icm-input" value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} />
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">Feedback</label>
                  <textarea className="icm-textarea" rows={4} value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Write constructive feedback…" />
                </div>
                <button type="submit" className="icm-btn icm-btn-primary" style={{ width: "100%" }}>Submit Grade</button>
              </form>
            </div>
          </div>
        )}

        {/* Create Assignment */}
        {showCreateModal && (
          <div className="icm-overlay">
            <div className="icm-modal">
              <div className="icm-modal-header">
                <p className="icm-modal-title">New Assignment</p>
                <button className="icm-close-btn" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateAssignment}>
                <div className="icm-form-group">
                  <label className="icm-label">Title</label>
                  <input required className="icm-input" value={assnForm.title} onChange={e => setAssnForm({ ...assnForm, title: e.target.value })} placeholder="e.g., Build a REST API" />
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">Description</label>
                  <textarea required className="icm-textarea" rows={4} value={assnForm.description} onChange={e => setAssnForm({ ...assnForm, description: e.target.value })} placeholder="Describe the assignment requirements…" />
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">Deadline</label>
                  <input required type="date" className="icm-input" value={assnForm.deadline} onChange={e => setAssnForm({ ...assnForm, deadline: e.target.value })} />
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">File (optional)</label>
                  <input type="file" className="icm-input" style={{ paddingTop: "7px" }} onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <div className="icm-form-group">
                  <label className="icm-checkbox-row">
                    <input type="checkbox" checked={assnForm.is_final_project} onChange={e => setAssnForm({ ...assnForm, is_final_project: e.target.checked })} />
                    <span className="icm-checkbox-label">Mark as Final Project</span>
                  </label>
                </div>
                <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                  <button type="button" className="icm-btn icm-btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" disabled={isPosting} className="icm-btn icm-btn-primary" style={{ flex: 1 }}>{isPosting ? "Creating…" : "Create Assignment"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Material */}
        {showMaterialModal && (
          <div className="icm-overlay">
            <div className="icm-modal">
              <div className="icm-modal-header">
                <p className="icm-modal-title">Upload Course Material</p>
                <button className="icm-close-btn" onClick={() => setShowMaterialModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateMaterial}>
                <div className="icm-form-group">
                  <label className="icm-label">Title</label>
                  <input required className="icm-input" value={materialForm.title} onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })} placeholder="e.g., Week 1 Slides" />
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">Description</label>
                  <textarea className="icm-textarea" rows={3} value={materialForm.description} onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })} placeholder="Brief description of the material" />
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">Material Type</label>
                  <select className="icm-select" value={materialForm.material_type} onChange={e => setMaterialForm({ ...materialForm, material_type: e.target.value })}>
                    <option value="document">Document (PDF, DOC)</option>
                    <option value="slides">Slides (PPT, Keynote)</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="icm-form-group">
                  <label className="icm-label">File</label>
                  <input type="file" className="icm-input" style={{ paddingTop: "7px" }} accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mp3,.wav" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <button type="submit" disabled={isPosting} className="icm-btn icm-btn-primary" style={{ width: "100%" }}>
                  {isPosting ? "Uploading…" : "Upload Material"}
                </button>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}

/* ── Shared empty-state helper ── */
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="icm-empty">
      <div className="icm-empty-icon">{icon}</div>
      <p className="icm-empty-title">{title}</p>
      <p className="icm-empty-sub">{sub}</p>
    </div>
  );
}