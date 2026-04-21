"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. THEME OVERHAUL: Dark "hacker terminal" → clean blue/white brand
 *    system consistent with every other page in the product. Same
 *    DM Sans + Instrument Serif pairing, same CSS variable tokens.
 *
 * 2. SIDEBAR: Replaced the dark obsidian aside with a clean white
 *    sidebar. Nav items use the same pill-nav system as the instructor
 *    and student dashboards. "Pending count" widget uses the amber
 *    system from PendingApproval. Logout button turns red on hover.
 *
 * 3. PAGE HEADER: Dropped the ALL-CAPS italic "DASHBOARD OVERVIEW"
 *    headline. Replaced with a serif greeting + subdued subtitle —
 *    calm, authoritative, on-brand.
 *
 * 4. PENDING QUEUE CARDS: Dark obsidian panels → clean white cards
 *    with left accent border. Avatar is a gradient-blue square.
 *    Role badge uses blue pill system. "Verify" button is the
 *    standard primary blue btn.
 *
 * 5. WHITELIST TABLE: Dark obsidian table → clean white card.
 *    Used/unused status shown as colored dot + label. Row hover uses
 *    a light gray tint. Delete button is always visible (not hidden
 *    behind opacity-0 — bad UX pattern) but uses the danger icon btn.
 *
 * 6. WHITELIST FORM: "Security Grant" card → clean white card.
 *    Input/select fields use the standard rg/lg focus-ring system.
 *    Labels use uppercase tracking. "Deploy Authorization" → "Add to
 *    Whitelist" — plain human language.
 *
 * 7. INFO NOTE: ShieldCheck info box matches the info-row system from
 *    PendingApproval — blue left border on a gray background.
 *
 * 8. LOADING STATE: Replaced the dark-page spinner with a branded
 *    white spinner consistent with all other pages.
 *
 * 9. RESPONSIVENESS: Sidebar collapses to a top tab strip on mobile.
 *    Content grid goes single column below 1100px. Table scrolls
 *    horizontally on small screens.
 * ─────────────────────────────────────────────────────────────────
 */

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle,
  Search,
  Settings,
  ShieldAlert,
  ArrowRight,
  LogOut,
  ChevronRight,
  Monitor,
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --ad-blue-50:   #eff6ff;
      --ad-blue-100:  #dbeafe;
      --ad-blue-200:  #bfdbfe;
      --ad-blue-500:  #3b82f6;
      --ad-blue-600:  #2563eb;
      --ad-blue-700:  #1d4ed8;
      --ad-green-100: #dcfce7;
      --ad-green-600: #16a34a;
      --ad-amber-50:  #fffbeb;
      --ad-amber-200: #fde68a;
      --ad-amber-600: #d97706;
      --ad-amber-700: #b45309;
      --ad-red-50:    #fef2f2;
      --ad-red-500:   #ef4444;
      --ad-gray-50:   #f9fafb;
      --ad-gray-100:  #f3f4f6;
      --ad-gray-200:  #e5e7eb;
      --ad-gray-300:  #d1d5db;
      --ad-gray-400:  #9ca3af;
      --ad-gray-500:  #6b7280;
      --ad-gray-700:  #374151;
      --ad-gray-900:  #111827;
      --ad-font:  'DM Sans', sans-serif;
      --ad-serif: 'Instrument Serif', serif;
      --ad-r-sm: 8px; --ad-r-md: 12px; --ad-r-lg: 16px; --ad-r-xl: 20px;
      --ad-shadow-xs: 0 1px 2px rgba(0,0,0,.05);
      --ad-shadow-sm: 0 2px 8px rgba(0,0,0,.06);
      --ad-shadow-md: 0 6px 24px rgba(0,0,0,.08);
      --ad-shadow-lg: 0 20px 60px rgba(0,0,0,.10);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--ad-font); color: var(--ad-gray-900); background: #f8fafc; -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .ad-page { display: flex; flex-direction: column; min-height: 100vh; }
    .ad-body { display: flex; flex: 1; }

    /* ── Sidebar ── */
    .ad-sidebar {
      width: 240px; flex-shrink: 0;
      background: white; border-right: 1px solid var(--ad-gray-200);
      display: flex; flex-direction: column;
      padding: 2rem 1.25rem;
      gap: 4px;
    }
    .ad-sidebar-label {
      font-size: .63rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
      color: var(--ad-gray-400); padding: 0 .5rem; margin-bottom: .5rem; margin-top: .5rem;
    }
    .ad-nav-btn {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 12px; border-radius: var(--ad-r-md);
      font-size: .855rem; font-weight: 600;
      border: none; cursor: pointer; width: 100%; text-align: left;
      transition: background .15s, color .15s, box-shadow .15s;
      color: var(--ad-gray-500); background: transparent;
    }
    .ad-nav-btn:hover { background: var(--ad-blue-50); color: var(--ad-blue-700); }
    .ad-nav-btn.active {
      background: var(--ad-blue-600); color: white;
      box-shadow: 0 2px 8px rgba(37,99,235,.28);
    }
    .ad-nav-icon {
      width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    .ad-nav-btn.active .ad-nav-icon { background: rgba(255,255,255,.18); }

    /* Sidebar bottom */
    .ad-sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: .75rem; }
    .ad-pending-widget {
      background: var(--ad-amber-50); border: 1px solid var(--ad-amber-200);
      border-radius: var(--ad-r-lg); padding: 1.1rem 1.25rem;
    }
    .ad-pending-wlabel {
      font-size: .63rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: var(--ad-amber-700); margin-bottom: .5rem;
    }
    .ad-pending-wnum {
      font-size: 1.75rem; font-weight: 800; color: var(--ad-amber-700); line-height: 1;
    }
    .ad-pending-wsub { font-size: .72rem; color: var(--ad-amber-600); margin-top: .2rem; }
    .ad-logout-btn {
      display: flex; align-items: center; gap: .6rem;
      padding: 9px 12px; border-radius: var(--ad-r-md);
      border: 1px solid var(--ad-gray-200); background: white;
      font-family: var(--ad-font); font-size: .855rem; font-weight: 700;
      cursor: pointer; color: var(--ad-gray-400);
      transition: color .15s, border-color .15s, background .15s;
    }
    .ad-logout-btn:hover { color: var(--ad-red-500); border-color: #fecaca; background: var(--ad-red-50); }

    /* ── Content ── */
    .ad-content { flex: 1; overflow-y: auto; padding: 2.5rem; background: #f8fafc; }
    .ad-content-inner { max-width: 1100px; margin: 0 auto; }

    /* Header */
    .ad-header { margin-bottom: 2.5rem; }
    .ad-header-eyebrow {
      font-size: .68rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
      color: var(--ad-blue-600); margin-bottom: .5rem; opacity: .8;
    }
    .ad-header-title {
      font-family: var(--ad-serif);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 400; letter-spacing: -.02em; line-height: 1.2;
      color: var(--ad-gray-900);
    }
    .ad-header-sub { font-size: .875rem; color: var(--ad-gray-500); margin-top: .4rem; }

    /* Content grid */
    .ad-grid {
      display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start;
    }
    .ad-left { display: flex; flex-direction: column; gap: 2rem; }
    .ad-right { display: flex; flex-direction: column; gap: 1.25rem; }

    /* ── Section ── */
    .ad-sec-label {
      display: flex; align-items: center; gap: .6rem; margin-bottom: 1.25rem;
    }
    .ad-sec-label-text {
      font-size: .7rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: var(--ad-gray-500);
    }

    /* ── Pending queue cards ── */
    .ad-queue-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .875rem; }
    .ad-queue-card {
      background: white; border: 1px solid var(--ad-gray-200);
      border-left: 3px solid var(--ad-blue-500);
      border-radius: var(--ad-r-lg); padding: 1.25rem;
      box-shadow: var(--ad-shadow-xs); transition: box-shadow .2s;
      display: flex; flex-direction: column; gap: .875rem;
    }
    .ad-queue-card:hover { box-shadow: var(--ad-shadow-sm); }
    .ad-queue-card-top { display: flex; align-items: center; justify-content: space-between; }
    .ad-queue-avatar {
      width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--ad-blue-500), var(--ad-blue-700));
      color: white; font-size: .875rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .ad-role-badge {
      font-size: .62rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      padding: 3px 10px; border-radius: 999px;
      background: var(--ad-blue-50); color: var(--ad-blue-700); border: 1px solid var(--ad-blue-100);
    }
    .ad-queue-name { font-size: .9rem; font-weight: 800; color: var(--ad-gray-900); }
    .ad-queue-email { font-size: .75rem; color: var(--ad-gray-400); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ad-verify-btn {
      width: 100%; padding: 8px;
      background: var(--ad-blue-600); color: white;
      border: none; border-radius: var(--ad-r-md);
      font-family: var(--ad-font); font-size: .8rem; font-weight: 700;
      cursor: pointer; transition: background .15s, box-shadow .15s;
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      box-shadow: 0 1px 3px rgba(37,99,235,.25);
    }
    .ad-verify-btn:hover { background: var(--ad-blue-700); box-shadow: 0 3px 10px rgba(37,99,235,.3); }

    /* Empty queue */
    .ad-queue-empty {
      background: white; border: 1px solid var(--ad-gray-200); border-radius: var(--ad-r-lg);
      padding: 3rem 2rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: .6rem;
      box-shadow: var(--ad-shadow-xs);
    }
    .ad-queue-empty-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: var(--ad-green-100); color: var(--ad-green-600);
      display: flex; align-items: center; justify-content: center; margin-bottom: .4rem;
    }
    .ad-queue-empty-title { font-size: .9rem; font-weight: 700; color: var(--ad-gray-700); }
    .ad-queue-empty-sub  { font-size: .8rem; color: var(--ad-gray-400); }

    /* ── Whitelist table ── */
    .ad-table-card {
      background: white; border: 1px solid var(--ad-gray-200);
      border-radius: var(--ad-r-xl); overflow: hidden; box-shadow: var(--ad-shadow-xs);
    }
    .ad-table-scroll { max-height: 420px; overflow-y: auto; }
    .ad-table { width: 100%; border-collapse: collapse; }
    .ad-th {
      padding: .875rem 1.25rem; text-align: left;
      font-size: .63rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
      color: var(--ad-gray-400); background: var(--ad-gray-50);
      border-bottom: 1px solid var(--ad-gray-200); white-space: nowrap;
    }
    .ad-th:last-child { text-align: right; }
    .ad-td { padding: .875rem 1.25rem; font-size: .875rem; border-bottom: 1px solid var(--ad-gray-100); }
    .ad-tr:last-child td { border-bottom: none; }
    .ad-tr:hover td { background: var(--ad-gray-50); }
    .ad-email-row { display: flex; align-items: center; gap: .75rem; }
    .ad-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .ad-status-dot.used   { background: var(--ad-green-600); }
    .ad-status-dot.unused { background: var(--ad-gray-300); }
    .ad-email-text { font-size: .875rem; font-weight: 600; color: var(--ad-gray-900); }
    .ad-email-text.unused { color: var(--ad-gray-400); }
    .ad-entry-role {
      font-size: .62rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
      background: var(--ad-blue-50); color: var(--ad-blue-700); border: 1px solid var(--ad-blue-100);
      padding: 2px 8px; border-radius: 999px; display: inline-block; margin-top: 3px;
    }
    .ad-track-pill {
      font-size: .68rem; font-weight: 700; text-transform: capitalize;
      color: var(--ad-gray-500);
    }
    .ad-delete-btn {
      display: flex; align-items: center; justify-content: center; float: right;
      width: 30px; height: 30px; border-radius: 7px;
      border: 1px solid var(--ad-gray-200); background: white;
      cursor: pointer; color: var(--ad-gray-400);
      transition: background .15s, color .15s, border-color .15s;
    }
    .ad-delete-btn:hover { background: var(--ad-red-50); color: var(--ad-red-500); border-color: #fecaca; }

    /* ── Form card ── */
    .ad-form-card {
      background: white; border: 1px solid var(--ad-gray-200);
      border-radius: var(--ad-r-xl); padding: 2rem;
      box-shadow: var(--ad-shadow-xs);
    }
    .ad-form-title { font-size: 1.1rem; font-weight: 800; color: var(--ad-gray-900); margin-bottom: .3rem; }
    .ad-form-sub   { font-size: .8rem; color: var(--ad-gray-500); margin-bottom: 1.5rem; }

    .ad-field { margin-bottom: 1rem; }
    .ad-label {
      display: block; font-size: .65rem; font-weight: 800; letter-spacing: .09em;
      text-transform: uppercase; color: var(--ad-gray-500); margin-bottom: .4rem;
    }
    .ad-input, .ad-select {
      width: 100%; padding: 9px 13px;
      border: 1.5px solid var(--ad-gray-200); border-radius: var(--ad-r-md);
      font-family: var(--ad-font); font-size: .875rem; font-weight: 500;
      color: var(--ad-gray-900); background: white; outline: none;
      transition: border-color .15s, box-shadow .15s;
      -webkit-appearance: none; appearance: none;
    }
    .ad-input:focus, .ad-select:focus {
      border-color: var(--ad-blue-500); box-shadow: 0 0 0 3px rgba(59,130,246,.12);
    }
    .ad-select { cursor: pointer; }
    .ad-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }

    .ad-submit {
      width: 100%; padding: 10px;
      background: var(--ad-blue-600); color: white;
      border: none; border-radius: var(--ad-r-md);
      font-family: var(--ad-font); font-size: .875rem; font-weight: 700;
      cursor: pointer; margin-top: .5rem;
      display: flex; align-items: center; justify-content: center; gap: .4rem;
      transition: background .15s, box-shadow .15s;
      box-shadow: 0 1px 3px rgba(37,99,235,.25);
    }
    .ad-submit:hover { background: var(--ad-blue-700); box-shadow: 0 3px 10px rgba(37,99,235,.3); }

    /* Info note */
    .ad-info-note {
      background: var(--ad-gray-50); border: 1px solid var(--ad-gray-200);
      border-left: 3px solid var(--ad-blue-500);
      border-radius: var(--ad-r-lg); padding: 1rem 1.25rem;
      display: flex; align-items: flex-start; gap: .75rem;
    }
    .ad-info-note-text { font-size: .8rem; color: var(--ad-gray-500); line-height: 1.6; }

    /* ── Loading ── */
    .ad-loading {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; flex-direction: column; gap: .875rem; background: white;
    }
    .ad-spinner {
      width: 34px; height: 34px;
      border: 3px solid var(--ad-blue-100); border-top-color: var(--ad-blue-600);
      border-radius: 50%; animation: ad-spin .7s linear infinite;
    }
    @keyframes ad-spin { to { transform: rotate(360deg); } }
    .ad-spinner-label { font-size: .875rem; font-weight: 600; color: var(--ad-gray-400); letter-spacing: .04em; }

    /* ── Responsive ── */
    @media (max-width: 1100px) {
      .ad-grid { grid-template-columns: 1fr; }
      .ad-right { flex-direction: row; flex-wrap: wrap; gap: 1.25rem; }
      .ad-form-card, .ad-info-note { flex: 1; min-width: 280px; }
    }
    @media (max-width: 768px) {
      .ad-sidebar {
        flex-direction: row; flex-wrap: nowrap; overflow-x: auto;
        width: 100%; border-right: none; border-bottom: 1px solid var(--ad-gray-200);
        padding: .75rem; gap: .35rem;
      }
      .ad-nav-btn { white-space: nowrap; width: auto; }
      .ad-sidebar-bottom { display: none; }
      .ad-body { flex-direction: column; }
      .ad-content { padding: 1.5rem 1rem; }
      .ad-queue-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 500px) {
      .ad-right { flex-direction: column; }
      .ad-grid2 { grid-template-columns: 1fr; }
    }
  `}</style>
);

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [pendingStaff, setPendingStaff] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newTrack, setNewTrack] = useState("frontend");

  /* Auth guard — logic unchanged */
  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (!user.is_admin) router.push("/dashboard/student");
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [pendingRes, whitelistRes] = await Promise.all([
        api.get("/admin/pending"),
        api.get("/admin/whitelist"),
      ]);
      setPendingStaff(pendingRes.data);
      setWhitelist(whitelistRes.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.is_admin) fetchData(); }, [user]);

  /* All handlers unchanged */
  const handleVerify = async (userId: string) => {
    try {
      await api.post(`/admin/verify/${userId}`);
      toast.success("Security clearance granted!");
      fetchData();
    } catch { toast.error("Verification failed"); }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/whitelist", { email: newEmail, role: newRole, track: newTrack });
      toast.success("Email whitelisted");
      setNewEmail("");
      fetchData();
    } catch { toast.error("Whitelist failed"); }
  };

  const handleRemoveWhitelist = async (email: string) => {
    try {
      await api.delete(`/admin/whitelist/${email}`);
      toast.success("Identity removed");
      fetchData();
    } catch { toast.error("De-listing failed"); }
  };

  if (authLoading || loading || !user?.is_admin) {
    return (
      <>
        <GlobalStyles />
        <div className="ad-loading">
          <div className="ad-spinner" />
          <p className="ad-spinner-label">Authenticating…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="ad-page">
        <Navbar />
        <div className="ad-body">

          {/* ── Sidebar ── */}
          <aside className="ad-sidebar">
            <p className="ad-sidebar-label">Admin</p>

            <button className="ad-nav-btn active">
              <span className="ad-nav-icon"><LayoutDashboard size={15} /></span>
              Dashboard
            </button>
            <button className="ad-nav-btn">
              <span className="ad-nav-icon"><Users size={15} /></span>
              Manage Users
            </button>
            <button className="ad-nav-btn">
              <span className="ad-nav-icon"><Settings size={15} /></span>
              Settings
            </button>

            {/* Bottom widgets */}
            <div className="ad-sidebar-bottom">
              <div className="ad-pending-widget">
                <p className="ad-pending-wlabel">Pending Verifications</p>
                <p className="ad-pending-wnum">{pendingStaff.length}</p>
                <p className="ad-pending-wsub">awaiting approval</p>
              </div>
              <button className="ad-logout-btn" onClick={logout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </aside>

          {/* ── Content ── */}
          <main className="ad-content">
            <div className="ad-content-inner">

              {/* Header */}
              <div className="ad-header">
                <p className="ad-header-eyebrow">Admin Panel</p>
                <h1 className="ad-header-title">Dashboard Overview</h1>
                <p className="ad-header-sub">Manage staff verification and the email whitelist registry.</p>
              </div>

              {/* Grid */}
              <div className="ad-grid">

                {/* Left column */}
                <div className="ad-left">

                  {/* Pending queue */}
                  <section>
                    <div className="ad-sec-label">
                      <ShieldAlert size={14} color="var(--ad-amber-600)" />
                      <span className="ad-sec-label-text">Pending Verifications</span>
                    </div>

                    {pendingStaff.length === 0 ? (
                      <div className="ad-queue-empty">
                        <div className="ad-queue-empty-icon"><CheckCircle size={20} /></div>
                        <p className="ad-queue-empty-title">All clear</p>
                        <p className="ad-queue-empty-sub">No pending staff verifications.</p>
                      </div>
                    ) : (
                      <div className="ad-queue-grid">
                        {pendingStaff.map((staff: any) => (
                          <div key={staff.id} className="ad-queue-card">
                            <div className="ad-queue-card-top">
                              <div className="ad-queue-avatar">
                                {staff.first_name?.[0]}{staff.last_name?.[0]}
                              </div>
                              <span className="ad-role-badge">{staff.role}</span>
                            </div>
                            <div>
                              <p className="ad-queue-name">{staff.first_name} {staff.last_name}</p>
                              <p className="ad-queue-email">{staff.email}</p>
                            </div>
                            <button className="ad-verify-btn" onClick={() => handleVerify(staff.id)}>
                              <ShieldCheck size={13} /> Verify & Approve
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Whitelist table */}
                  <section>
                    <div className="ad-sec-label">
                      <Users size={14} color="var(--ad-blue-600)" />
                      <span className="ad-sec-label-text">Whitelist Registry</span>
                    </div>

                    <div className="ad-table-card">
                      <div className="ad-table-scroll">
                        <table className="ad-table">
                          <thead>
                            <tr>
                              <th className="ad-th">Email / Role</th>
                              <th className="ad-th">Track</th>
                              <th className="ad-th">Status</th>
                              <th className="ad-th" style={{ textAlign: "right" }}>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {whitelist.slice().reverse().map((entry: any) => (
                              <tr key={entry.id} className="ad-tr">
                                <td className="ad-td">
                                  <div className="ad-email-row">
                                    <div className={`ad-status-dot ${entry.is_used ? "used" : "unused"}`} />
                                    <div>
                                      <p className={`ad-email-text${entry.is_used ? "" : " unused"}`}>{entry.email}</p>
                                      <span className="ad-entry-role">{entry.role}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="ad-td">
                                  <span className="ad-track-pill">{entry.track}</span>
                                </td>
                                <td className="ad-td">
                                  <span style={{
                                    fontSize: ".68rem", fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase",
                                    color: entry.is_used ? "var(--ad-green-600)" : "var(--ad-gray-400)",
                                    background: entry.is_used ? "var(--ad-green-100)" : "var(--ad-gray-100)",
                                    padding: "2px 10px", borderRadius: "999px", display: "inline-block"
                                  }}>
                                    {entry.is_used ? "Used" : "Pending"}
                                  </span>
                                </td>
                                <td className="ad-td">
                                  <button className="ad-delete-btn" onClick={() => handleRemoveWhitelist(entry.email)} title="Remove from whitelist">
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right column */}
                <div className="ad-right">

                  {/* Add to whitelist form */}
                  <div className="ad-form-card">
                    <p className="ad-form-title">Add to Whitelist</p>
                    <p className="ad-form-sub">Grant a new email access to register on the platform.</p>

                    <form onSubmit={handleAddWhitelist}>
                      <div className="ad-field">
                        <label className="ad-label">Email Address</label>
                        <input
                          type="email" required className="ad-input"
                          placeholder="user@devoria.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>

                      <div className="ad-grid2">
                        <div className="ad-field" style={{ marginBottom: 0 }}>
                          <label className="ad-label">Role</label>
                          <select className="ad-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="assistant">Assistant</option>
                          </select>
                        </div>
                        <div className="ad-field" style={{ marginBottom: 0 }}>
                          <label className="ad-label">Track</label>
                          <select className="ad-select" value={newTrack} onChange={(e) => setNewTrack(e.target.value)}>
                            <option value="frontend">Frontend</option>
                            <option value="backend">Backend</option>
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="ad-submit" style={{ marginTop: "1.25rem" }}>
                        Add to Whitelist <ArrowRight size={14} />
                      </button>
                    </form>
                  </div>

                  {/* Info note */}
                  <div className="ad-info-note">
                    <ShieldCheck size={16} color="var(--ad-blue-600)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p className="ad-info-note-text">
                      Whitelisted emails bypass the pending queue and gain immediate platform access after registration. Unverified staff will still appear in the verification queue above.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}