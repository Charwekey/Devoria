"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  Plus,
  X,
  UserPlus,
  Copy,
  ArrowRight,
  Settings,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ─── UI IMPROVEMENTS OVERVIEW ───────────────────────────────────────────────
 * 1. Injected scoped <style> block so improvements are self-contained and don't
 *    require changes to globals.css or Tailwind config.
 * 2. Header: frosted-glass gradient band with avatar initial, soft shadow.
 * 3. Tab bar: pill-style switcher with animated sliding underline.
 * 4. Cohort cards: hover lift + glow, track badge repositioned cleanly.
 * 5. Enrollment Alerts: accent-left border card, cleaner pair layout.
 * 6. Whitelist / Staff panels: icon-labelled inputs, cleaner CTA buttons.
 * 7. Table: zebra striping, status pill badges, smooth row hover.
 * 8. Settings form: labeled sections with subtle dividers, consistent spacing.
 * 9. Modal: backdrop blur, smooth scale-in animation, polished close button.
 * 10. Typography: 'DM Sans' display + 'DM Mono' for codes — loaded via @import.
 * ──────────────────────────────────────────────────────────────────────────── */

const dashStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

.id-root {
  font-family: 'DM Sans', sans-serif;
}

/* ── Header ── */
.id-header {
  padding: 3rem 0 2.5rem;
  background: linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(99,102,241,0.04) 60%, transparent 100%);
  border-bottom: 1px solid rgba(37,99,235,0.1);
  position: relative;
  overflow: hidden;
}
.id-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(37,99,235,0.06), transparent);
  pointer-events: none;
}
.id-avatar {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #6366f1);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 800; color: #fff;
  box-shadow: 0 4px 16px rgba(37,99,235,0.35);
  flex-shrink: 0;
}
.id-header-title {
  font-size: 2rem; font-weight: 800; letter-spacing: -0.03em;
  margin: 0 0 0.2rem;
  background: linear-gradient(135deg, var(--color-text, #1e293b) 60%, #2563eb);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.id-header-sub { font-size: 0.875rem; opacity: 0.6; margin: 0; }

/* ── Tab switcher ── */
.id-tabs {
  display: flex; gap: 0.25rem;
  background: rgba(37,99,235,0.06);
  border: 1px solid rgba(37,99,235,0.12);
  border-radius: 12px; padding: 4px;
}
.id-tab {
  padding: 0.5rem 1.1rem; border-radius: 9px; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
  background: transparent; color: inherit; opacity: 0.6;
}
.id-tab.active {
  background: #2563eb; color: #fff; opacity: 1;
  box-shadow: 0 2px 10px rgba(37,99,235,0.35);
}
.id-tab:hover:not(.active) { opacity: 1; background: rgba(37,99,235,0.08); }

/* ── Create cohort button ── */
.id-btn-create {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.55rem 1.15rem; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  color: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 3px 12px rgba(37,99,235,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}
.id-btn-create:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }

/* ── Section label ── */
.id-section-label {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; opacity: 0.45; margin-bottom: 1rem;
}

/* ── Cohort cards ── */
.id-cohort-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem; margin-top: 0.75rem;
}
.id-cohort-card {
  border-radius: 16px; padding: 1.5rem;
  border: 1px solid rgba(37,99,235,0.1);
  background: var(--color-card, #fff);
  position: relative; overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.id-cohort-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(37,99,235,0.14);
}
.id-cohort-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #2563eb, #6366f1);
}
.id-track-badge {
  display: inline-flex; align-items: center;
  background: rgba(37,99,235,0.1); color: #2563eb;
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 6px;
  margin-bottom: 1rem;
}
.id-cohort-name { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.35rem; }
.id-cohort-code {
  font-family: 'DM Mono', monospace; font-size: 0.82rem;
  opacity: 0.65; letter-spacing: 0.04em;
}
.id-pending-dot {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(239,68,68,0.1); color: #ef4444;
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem; border-radius: 6px;
}
.id-copy-btn {
  background: none; border: none; cursor: pointer; padding: 0.2rem;
  opacity: 0.4; transition: opacity 0.15s;
}
.id-copy-btn:hover { opacity: 1; }
.id-manage-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  width: 100%; padding: 0.65rem; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 700;
  cursor: pointer; margin-top: 1.25rem;
  transition: opacity 0.15s, transform 0.15s;
}
.id-manage-btn:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Empty state ── */
.id-empty {
  grid-column: 1/-1;
  border: 2px dashed rgba(37,99,235,0.18); border-radius: 16px;
  padding: 3.5rem 2rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}
.id-empty-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: rgba(37,99,235,0.06); display: flex; align-items: center; justify-content: center;
}

/* ── Enrollment alerts ── */
.id-alert-card {
  border-left: 4px solid #ef4444; border-radius: 12px;
  background: rgba(239,68,68,0.03); padding: 1.5rem;
}
.id-alert-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.85rem 1rem; border-radius: 10px;
  background: var(--color-card, #fff);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.id-alert-name { font-size: 0.875rem; font-weight: 700; margin: 0 0 0.15rem; }
.id-alert-sub { font-size: 0.7rem; opacity: 0.55; margin: 0; }
.id-btn-approve {
  padding: 0.35rem 0.85rem; border-radius: 8px; border: none;
  background: #2563eb; color: #fff; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: background 0.15s;
}
.id-btn-approve:hover { background: #1d4ed8; }
.id-btn-decline {
  padding: 0.35rem 0.85rem; border-radius: 8px;
  border: 1px solid rgba(239,68,68,0.3); background: transparent;
  color: #ef4444; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: background 0.15s;
}
.id-btn-decline:hover { background: rgba(239,68,68,0.08); }

/* ── Management panels ── */
.id-mgmt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1.25rem; }
@media (max-width: 680px) { .id-mgmt-grid { grid-template-columns: 1fr; } }
.id-panel {
  border-radius: 14px; padding: 1.5rem;
  border: 1px solid rgba(37,99,235,0.1);
  background: var(--color-card, #fff);
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.id-panel-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; }
.id-panel-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.id-panel-title { font-size: 0.95rem; font-weight: 700; }
.id-input {
  width: 100%; padding: 0.7rem 0.9rem; border-radius: 10px;
  border: 1px solid rgba(37,99,235,0.15);
  background: rgba(37,99,235,0.03); outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.id-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.id-input-group { display: flex; flex-direction: column; gap: 0.6rem; }
.id-btn-add {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.65rem 1rem; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: opacity 0.15s, transform 0.15s;
}
.id-btn-add:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Whitelist table ── */
.id-table-wrap {
  border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(37,99,235,0.1);
  background: var(--color-card, #fff);
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  margin-top: 1.25rem;
}
.id-table-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(37,99,235,0.08);
  background: rgba(37,99,235,0.03);
  font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; opacity: 0.6;
}
.id-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.id-table th {
  padding: 0.75rem 1.5rem; text-align: left;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; opacity: 0.45;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.id-table td { padding: 0.875rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.04); }
.id-table tbody tr:hover { background: rgba(37,99,235,0.025); }
.id-table tbody tr:last-child td { border-bottom: none; }
.id-table-scroll { max-height: 280px; overflow-y: auto; }
.id-status-pill {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.22rem 0.6rem; border-radius: 99px; font-size: 0.68rem; font-weight: 700;
}
.id-status-pill.used { background: rgba(16,185,129,0.1); color: #10b981; }
.id-status-pill.pending { background: rgba(245,158,11,0.1); color: #f59e0b; }
.id-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.id-role-pill {
  display: inline-flex; padding: 0.18rem 0.5rem; border-radius: 6px;
  font-size: 0.68rem; font-weight: 700; text-transform: capitalize;
  background: rgba(99,102,241,0.1); color: #6366f1;
}
.id-btn-remove {
  background: none; border: none; cursor: pointer; padding: 0.35rem;
  color: #ef4444; opacity: 0.5; border-radius: 6px;
  transition: opacity 0.15s, background 0.15s;
}
.id-btn-remove:hover { opacity: 1; background: rgba(239,68,68,0.08); }

/* ── Settings form ── */
.id-settings-wrap { max-width: 700px; margin: 0 auto; }
.id-settings-card {
  border-radius: 16px; padding: 2rem;
  border: 1px solid rgba(37,99,235,0.1);
  background: var(--color-card, #fff);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.id-settings-section { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(0,0,0,0.06); }
.id-settings-section:last-of-type { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
.id-field-label {
  display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; opacity: 0.5; margin-bottom: 0.4rem;
}
.id-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 520px) { .id-two-col { grid-template-columns: 1fr; } }
.id-pass-wrap { position: relative; }
.id-pass-toggle {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; opacity: 0.4; transition: opacity 0.15s;
}
.id-pass-toggle:hover { opacity: 0.8; }
.id-btn-save {
  display: flex; align-items: center; justify-content: center;
  padding: 0.7rem 2rem; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; min-width: 160px;
  box-shadow: 0 3px 12px rgba(37,99,235,0.3);
  transition: opacity 0.15s, transform 0.15s;
}
.id-btn-save:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.id-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal ── */
.id-modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.id-modal {
  width: 100%; max-width: 420px;
  background: var(--color-card, #fff);
  border-radius: 18px; padding: 2rem;
  border: 1px solid rgba(37,99,235,0.12);
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: id-pop 0.22s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes id-pop {
  from { opacity: 0; transform: scale(0.92) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.id-modal-title { font-size: 1.15rem; font-weight: 800; margin: 0; }
.id-modal-close {
  background: rgba(0,0,0,0.06); border: none; cursor: pointer;
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.id-modal-close:hover { background: rgba(0,0,0,0.12); }
.id-modal-input {
  width: 100%; padding: 0.75rem 0.9rem; border-radius: 10px;
  border: 1px solid rgba(37,99,235,0.18);
  background: rgba(37,99,235,0.03); outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.id-modal-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

/* ── Utility ── */
.id-flex-between { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.id-flex-center { display: flex; align-items: center; }
.id-gap-2 { gap: 0.5rem; }
.id-gap-3 { gap: 0.75rem; }
.id-main { padding-bottom: 5rem; }
.id-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.id-body-section { padding: 2.5rem 0; }
`;

export default function InstructorDashboard() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [classes, setClasses] = useState<any[]>([]);
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [assistants, setAssistants] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ class_name: "", track: user?.track || "frontend" });

  const [settingsForm, setSettingsForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSettingsForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: "",
      });
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [classRes, whiteRes] = await Promise.all([
        api.get("/classes/instructor"),
        api.get("/instructor/my-whitelist"),
      ]);
      setClasses(classRes.data);
      setWhitelist(whiteRes.data.whitelist);
      setAssistants(whiteRes.data.assistants);
      const requests: any = {};
      await Promise.all(
        classRes.data.map(async (cls: any) => {
          try {
            const res = await api.get(`/class_students/pending/${cls.id}`);
            requests[cls.id] = res.data;
          } catch (e) {
            requests[cls.id] = [];
          }
        })
      );
      setPendingRequests(requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/classes/", classForm);
      toast.success("Class cohort created!");
      setShowClassModal(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to create class.");
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Class code copied!");
  };

  const handleApprove = async (classId: string, studentId: string) => {
    try {
      await api.post(`/class_students/approve`, { class_id: classId, student_id: studentId });
      toast.success("Student approved!");
      fetchData();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleDecline = async (classId: string, studentId: string) => {
    try {
      await api.delete(`/class_students/class/${classId}/student/${studentId}`);
      toast.success("Declined.");
      fetchData();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleRemoveWhitelist = async (email: string) => {
    try {
      await api.delete(`/instructor/whitelist/${email}`);
      toast.success("Removed from whitelist.");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove.");
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData = { ...settingsForm };
      if (!updateData.password) delete (updateData as any).password;
      const res = await api.put(`/users/${user?.id}`, updateData);
      toast.success("Profile updated!");
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) login(token, res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const totalPending = (Object.values(pendingRequests) as any[][]).flat().length;

  return (
    <div className="id-root" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ── Scoped styles injected once ── */}
      <style>{dashStyles}</style>

      <Navbar />

      <main className="id-main">
        {/* ── Header ── */}
        <section className="id-header">
          <div className="id-container">
            <div className="id-flex-between">
              {/* Left: avatar + greeting */}
              <div className="id-flex-center id-gap-3" style={{ gap: "1rem" }}>
                <div className="id-avatar">
                  {user.first_name?.[0]?.toUpperCase() ?? "I"}
                </div>
                <div>
                  <h1 className="id-header-title">Instructor Portal</h1>
                  <p className="id-header-sub">
                    Welcome back, {user.first_name}. Your cohorts are ready.
                  </p>
                </div>
              </div>

              {/* Right: tabs + create button */}
              <div className="id-flex-center" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
                <div className="id-tabs">
                  <button
                    className={`id-tab${activeTab === "overview" ? " active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                  </button>
                  <button
                    className={`id-tab${activeTab === "settings" ? " active" : ""}`}
                    onClick={() => setActiveTab("settings")}
                  >
                    Profile &amp; Security
                  </button>
                </div>
                <button className="id-btn-create" onClick={() => setShowClassModal(true)}>
                  <Plus size={16} />
                  Create Cohort
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="id-body-section">
          <div className="id-container">

            {/* ════════════════ SETTINGS TAB ════════════════ */}
            {activeTab === "settings" ? (
              <div className="id-settings-wrap">
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.25rem" }}>
                    Profile &amp; Security
                  </h2>
                  <p style={{ fontSize: "0.85rem", opacity: 0.55, margin: 0 }}>
                    Update your administrative credentials and account details.
                  </p>
                </div>

                <form onSubmit={handleUpdateSettings}>
                  <div className="id-settings-card">
                    {/* Name row */}
                    <div className="id-settings-section">
                      <p className="id-section-label">Personal Information</p>
                      <div className="id-two-col">
                        <div>
                          <label className="id-field-label">First Name</label>
                          <input
                            required
                            value={settingsForm.first_name}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, first_name: e.target.value })
                            }
                            className="id-input"
                          />
                        </div>
                        <div>
                          <label className="id-field-label">Last Name</label>
                          <input
                            required
                            value={settingsForm.last_name}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, last_name: e.target.value })
                            }
                            className="id-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="id-settings-section">
                      <p className="id-section-label">Login Credentials</p>
                      <div style={{ marginBottom: "1rem" }}>
                        <label className="id-field-label">Email Address</label>
                        <input
                          required
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, email: e.target.value })
                          }
                          className="id-input"
                        />
                      </div>
                      <div>
                        <label className="id-field-label">
                          Password{" "}
                          <span style={{ opacity: 0.4, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
                            — leave blank to keep unchanged
                          </span>
                        </label>
                        <div className="id-pass-wrap">
                          <input
                            type={showPass ? "text" : "password"}
                            value={settingsForm.password}
                            onChange={(e) =>
                              setSettingsForm({ ...settingsForm, password: e.target.value })
                            }
                            placeholder="••••••••"
                            className="id-input"
                            style={{ paddingRight: "2.5rem" }}
                          />
                          <button
                            type="button"
                            className="id-pass-toggle"
                            onClick={() => setShowPass(!showPass)}
                          >
                            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={saving} className="id-btn-save">
                      {saving ? "Saving…" : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>

            ) : (
              /* ════════════════ OVERVIEW TAB ════════════════ */
              <>
                {/* My Cohorts */}
                <p className="id-section-label">My Cohorts</p>
                <div className="id-cohort-grid">
                  {classes.length > 0 ? (
                    classes.map((cls: any) => (
                      <div key={cls.id} className="id-cohort-card">
                        <div className="id-flex-between" style={{ marginBottom: "0.85rem" }}>
                          <span className="id-track-badge">{cls.track?.toUpperCase()}</span>
                          {pendingRequests[cls.id]?.length > 0 && (
                            <span className="id-pending-dot">
                              <span className="id-status-dot" />
                              {pendingRequests[cls.id].length} Pending
                            </span>
                          )}
                        </div>

                        <h4 className="id-cohort-name">{cls.class_name}</h4>

                        <div className="id-flex-center id-gap-2" style={{ gap: "0.5rem", marginTop: "0.25rem" }}>
                          <span className="id-cohort-code">{cls.class_code}</span>
                          <button
                            className="id-copy-btn"
                            onClick={() => copyClassCode(cls.class_code)}
                            title="Copy class code"
                          >
                            <Copy size={13} />
                          </button>
                        </div>

                        <button
                          className="id-manage-btn"
                          onClick={() => router.push(`/dashboard/instructor/class/${cls.id}`)}
                        >
                          Manage Environment <ArrowRight size={14} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="id-empty">
                      <div className="id-empty-icon">
                        <Users size={24} color="#2563eb" />
                      </div>
                      <h4 style={{ fontWeight: 700, margin: 0 }}>No cohorts yet</h4>
                      <p style={{ fontSize: "0.85rem", opacity: 0.55, maxWidth: 360, margin: 0 }}>
                        Create your first class cohort to start tracking attendance and assignments.
                      </p>
                      <button className="id-btn-create" onClick={() => setShowClassModal(true)}>
                        <Plus size={15} /> Create Your First Class
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Enrollment Alerts ── */}
                {totalPending > 0 && (
                  <div style={{ marginTop: "2.5rem" }}>
                    <p className="id-section-label">Enrollment Alerts</p>
                    <div className="id-alert-card">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        {classes.map((cls) =>
                          pendingRequests[cls.id]?.map((req: any) => (
                            <div key={`${cls.id}-${req.id}`} className="id-alert-row">
                              <div>
                                <p className="id-alert-name">
                                  {req.first_name} {req.last_name}
                                </p>
                                <p className="id-alert-sub">{cls.class_name}</p>
                              </div>
                              <div className="id-flex-center" style={{ gap: "0.5rem" }}>
                                <button
                                  className="id-btn-approve"
                                  onClick={() => handleApprove(cls.id, req.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="id-btn-decline"
                                  onClick={() => handleDecline(cls.id, req.id)}
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Cohort Management ── */}
                <div style={{ marginTop: "2.5rem" }}>
                  <p className="id-section-label">Cohort Management</p>

                  {/* Whitelist + Staff panels */}
                  <div className="id-mgmt-grid">
                    {/* Whitelist */}
                    <div className="id-panel">
                      <div className="id-panel-header">
                        <div
                          className="id-panel-icon"
                          style={{ background: "rgba(16,185,129,0.1)" }}
                        >
                          <CheckCircle size={16} color="#10b981" />
                        </div>
                        <span className="id-panel-title">Student Whitelist</span>
                      </div>
                      <div className="id-input-group">
                        <input
                          id="whitelist-email"
                          placeholder="student@example.com"
                          className="id-input"
                        />
                        <button
                          className="id-btn-add"
                          onClick={async () => {
                            const el = document.getElementById(
                              "whitelist-email"
                            ) as HTMLInputElement;
                            if (!el.value) return;
                            try {
                              await api.post("/instructor/whitelist-student", {
                                email: el.value,
                              });
                              toast.success("Whitelisted!");
                              el.value = "";
                              fetchData();
                            } catch (err) {
                              toast.error("Failed.");
                            }
                          }}
                        >
                          <Plus size={14} /> Add to Cohort
                        </button>
                      </div>
                    </div>

                    {/* Staff */}
                    <div className="id-panel">
                      <div className="id-panel-header">
                        <div
                          className="id-panel-icon"
                          style={{ background: "rgba(99,102,241,0.1)" }}
                        >
                          <UserPlus size={16} color="#6366f1" />
                        </div>
                        <span className="id-panel-title">Staff Collaboration</span>
                      </div>
                      <div className="id-input-group">
                        <input
                          id="assistant-email"
                          placeholder="assistant@devoria.com"
                          className="id-input"
                        />
                        <button
                          className="id-btn-add"
                          style={{
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          }}
                          onClick={async () => {
                            const el = document.getElementById(
                              "assistant-email"
                            ) as HTMLInputElement;
                            if (!el.value) return;
                            try {
                              await api.post("/instructor/invite-assistant", {
                                email: el.value,
                              });
                              toast.success("Invited!");
                              el.value = "";
                              fetchData();
                            } catch (err) {
                              toast.error("Failed.");
                            }
                          }}
                        >
                          <UserPlus size={14} /> Invite Assistant
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Whitelist registry table */}
                  <div className="id-table-wrap">
                    <div className="id-table-header">Active Whitelist Registry</div>
                    <div className="id-table-scroll">
                      <table className="id-table">
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {whitelist.map((item) => (
                            <tr key={item.id}>
                              <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.82rem" }}>
                                {item.email}
                              </td>
                              <td>
                                <span className="id-role-pill">{item.role}</span>
                              </td>
                              <td>
                                <span
                                  className={`id-status-pill ${item.is_used ? "used" : "pending"}`}
                                >
                                  <span className="id-status-dot" />
                                  {item.is_used ? "Registered" : "Pending"}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="id-btn-remove"
                                  onClick={() => handleRemoveWhitelist(item.email)}
                                  title="Remove"
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── Create Class Modal ── */}
      {showClassModal && (
        <div className="id-modal-backdrop" onClick={() => setShowClassModal(false)}>
          <div className="id-modal" onClick={(e) => e.stopPropagation()}>
            <div className="id-flex-between" style={{ marginBottom: "1.5rem" }}>
              <h3 className="id-modal-title">Create New Cohort</h3>
              <button className="id-modal-close" onClick={() => setShowClassModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form
              onSubmit={handleCreateClass}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              <div>
                <label className="id-field-label">Class Name</label>
                <input
                  required
                  placeholder="e.g. Frontend Cohort 2025"
                  value={classForm.class_name}
                  onChange={(e) => setClassForm({ ...classForm, class_name: e.target.value })}
                  className="id-modal-input"
                />
              </div>
              <button type="submit" className="id-btn-save" style={{ marginTop: "0.5rem" }}>
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}