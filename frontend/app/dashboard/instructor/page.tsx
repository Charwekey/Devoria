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
  EyeOff
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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

  // Settings Form
  const [settingsForm, setSettingsForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    password: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
        setSettingsForm({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            password: ""
        });
        fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [classRes, whiteRes] = await Promise.all([
        api.get("/classes/instructor"),
        api.get("/instructor/my-whitelist")
      ]);
      setClasses(classRes.data);
      setWhitelist(whiteRes.data.whitelist);
      setAssistants(whiteRes.data.assistants);
      
      // Fetch pending requests for each class from CORRECT ENDPOINT
      const requests: any = {};
      await Promise.all(classRes.data.map(async (cls: any) => {
        try {
            const res = await api.get(`/class_students/pending/${cls.id}`);
            requests[cls.id] = res.data;
        } catch (e) {
            requests[cls.id] = [];
        }
      }));
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
        // Update local auth context
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) login(token, res.data);
        }
    } catch (err: any) {
        toast.error(err.response?.data?.detail || "Update failed");
    } finally {
        setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="app-container" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ paddingBottom: "5rem" }}>
        {/* Header Section */}
        <section style={{ padding: "4rem 0 2rem", background: "linear-gradient(to bottom, rgba(37, 99, 235, 0.05), transparent)" }}>
          <div className="container">
            <div className="flex-between">
              <div className="animate-fade-in">
                <h1 className="text-h1" style={{ fontSize: "2.5rem" }}>Portal Master</h1>
                <p className="text-body" style={{ opacity: 0.7 }}>Welcome back, {user.first_name}. Your cohorts are secure.</p>
              </div>
              <div className="flex-center gap-1">
                 <button onClick={() => setActiveTab("overview")} className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-ghost"}`}>Overview</button>
                 <button onClick={() => setActiveTab("settings")} className={`btn ${activeTab === "settings" ? "btn-primary" : "btn-ghost"}`}>Profile & Security</button>
                 <button className="btn btn-primary" onClick={() => setShowClassModal(true)}><Plus size={20} /> Create Cohort</button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "2rem" }}>
          <div className="container">
            {activeTab === "settings" ? (
              <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
                 <div style={{ marginBottom: "2rem" }}>
                    <h3 className="text-h2" style={{ fontSize: "1.75rem" }}>Instructor Access Controls</h3>
                    <p className="text-small">Update your administrative credentials and security settings.</p>
                 </div>
                 
                 <form onSubmit={handleUpdateSettings}>
                    <div style={{ padding: "2.5rem" }}>
                       <Card>
                          <div className="grid-cols-2 gap-4" style={{ marginBottom: "2rem" }}>
                             <div className="flex-column gap-1">
                                <label className="text-small" style={{ fontWeight: 800, opacity: 0.6 }}>FIRST NAME</label>
                                <input required value={settingsForm.first_name} onChange={e => setSettingsForm({...settingsForm, first_name: e.target.value})} className="terminal-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem" }} />
                             </div>
                             <div className="flex-column gap-1">
                                <label className="text-small" style={{ fontWeight: 800, opacity: 0.6 }}>LAST NAME</label>
                                <input required value={settingsForm.last_name} onChange={e => setSettingsForm({...settingsForm, last_name: e.target.value})} className="terminal-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem" }} />
                             </div>
                          </div>
                          
                          <div className="flex-column gap-1" style={{ marginBottom: "2rem" }}>
                             <label className="text-small" style={{ fontWeight: 800, opacity: 0.6 }}>EMAIL ADDRESS</label>
                             <input required type="email" value={settingsForm.email} onChange={e => setSettingsForm({...settingsForm, email: e.target.value})} className="terminal-input" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem" }} />
                          </div>

                          <div className="flex-column gap-1" style={{ marginBottom: "2.5rem" }}>
                             <label className="text-small" style={{ fontWeight: 800, opacity: 0.6 }}>PASSWORD (LEAVE BLANK TO UNCHANGED)</label>
                             <div style={{ position: "relative" }}>
                                <input 
                                   type={showPass ? "text" : "password"} 
                                   value={settingsForm.password} 
                                   onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} 
                                   className="terminal-input" 
                                   placeholder="••••••••"
                                   style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem" }} 
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                                   {showPass ? <EyeOff size={18} opacity={0.5} /> : <Eye size={18} opacity={0.5} />}
                                </button>
                             </div>
                          </div>

                          <button type="submit" disabled={saving} className="btn btn-primary" style={{ height: "3.5rem", width: "200px" }}>
                             {saving ? "SAVING..." : "UPDATE PROFILE"}
                          </button>
                       </Card>
                    </div>
                 </form>
              </div>
            ) : (
              <>
                <div className="animate-fade-in">
                  <h3 className="text-h3" style={{ fontSize: "1.1rem", marginTop: "1rem" }}>My Cohorts</h3>
                  <div className="grid-cols-3 gap-2" style={{ marginTop: "0.5rem" }}>
                    {classes.length > 0 ? (
                      classes.map((cls: any) => (
                        <div key={cls.id} style={{ padding: "1.5rem", position: "relative" }}>
                          <Card className="obsidian-card animate-fade-in">
                            <div style={{ position: "absolute", top: 0, right: 0, padding: "0.5rem", background: "var(--color-terminal-indigo)", color: "white", borderBottomLeftRadius: "1rem" }}>
                              <span className="text-small" style={{ fontWeight: 800, fontSize: "0.65rem" }}>{cls.track?.toUpperCase()}</span>
                            </div>
                            
                            <div className="flex-between" style={{ marginBottom: "1rem" }}>
                              <div style={{ background: "rgba(37, 99, 235, 0.05)", padding: "0.6rem", borderRadius: "0.5rem" }}>
                                <Users size={20} color="var(--color-primary)" />
                              </div>
                              {pendingRequests[cls.id]?.length > 0 && (
                                <span style={{ background: "var(--color-error)", color: "white", padding: "0.2rem 0.5rem", borderRadius: "1rem", fontSize: "0.65rem", fontWeight: 800 }}>
                                  {pendingRequests[cls.id].length} PENDING
                                </span>
                              )}
                            </div>

                            <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>{cls.class_name}</h4>
                            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                               <p className="text-small" style={{ opacity: 0.7, margin: 0 }}>Code: <strong style={{ letterSpacing: "0.05em" }}>{cls.class_code}</strong></p>
                               <button className="btn btn-ghost" style={{ padding: "0.2rem" }} onClick={() => copyClassCode(cls.class_code)} title="Copy Code">
                                  <Copy size={12} />
                               </button>
                            </div>
                            
                            <button 
                              className="btn-premium-indigo" 
                              style={{ width: "100%", padding: "0.75rem", fontSize: "0.85rem", marginTop: "1rem" }}
                              onClick={() => router.push(`/dashboard/instructor/class/${cls.id}`)}
                            >
                              Manage Environment
                            </button>
                          </Card>
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: "span 3", padding: "3rem", textAlign: "center", border: "2px dashed var(--color-border)" }}>
                        <Card>
                          <Plus size={48} style={{ marginBottom: "1rem", opacity: 0.2, margin: "0 auto" }} />
                          <h4 className="text-h3">Ready to start?</h4>
                          <p className="text-small" style={{ maxWidth: "400px", margin: "0.5rem auto", marginBottom: "1.5rem" }}>
                            Create your first class cohort to start tracking attendance and assignments.
                          </p>
                          <button className="btn btn-primary" onClick={() => setShowClassModal(true)}>Create Your First Class</button>
                        </Card>
                      </div>
                    )}
                  </div>

                  {/* Shared Requests Drawer (Quick lookup) */}
                  {Object.values(pendingRequests).flat().length > 0 && (
                    <div style={{ marginTop: "3rem" }}>
                        <div style={{ padding: "1.5rem", borderLeft: "4px solid var(--color-error)" }}>
                            <Card>
                                <h3 className="text-h3" style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Enrollment Alerts</h3>
                                <div className="grid-cols-2 gap-2">
                                    {classes.map((cls) => (
                                        pendingRequests[cls.id]?.map((req: any) => (
                                            <div key={`${cls.id}-${req.id}`} className="flex-between glass-panel" style={{ padding: "1rem", borderRadius: "0.5rem" }}>
                                                <div>
                                                    <h4 style={{ fontWeight: 700, fontSize: "0.85rem" }}>{req.first_name} {req.last_name}</h4>
                                                    <p className="text-small" style={{ fontSize: "0.7rem", opacity: 0.6 }}>Class: {cls.class_name}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(cls.id, req.id)}>Approve</button>
                                                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => handleDecline(cls.id, req.id)}>Decline</button>
                                                </div>
                                            </div>
                                        ))
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                  )}

                  <div style={{ marginTop: "3rem" }}>
                    <div className="flex-between" style={{ marginBottom: "1rem" }}>
                      <h3 className="text-h3" style={{ fontSize: "1.25rem", fontWeight: 800 }}>Cohort Management</h3>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-4">
                      <div style={{ padding: "1.5rem" }}>
                        <Card className="obsidian-card">
                          <div className="flex items-center gap-3 mb-6">
                            <CheckCircle size={20} color="#10b981" />
                            <h4 style={{ fontWeight: 700 }}>Student Whitelist</h4>
                          </div>
                          <div className="flex flex-col gap-2">
                            <input id="whitelist-email" placeholder="student@example.com" className="terminal-input w-full p-4 rounded-xl" style={{ outline: "none" }} />
                            <button className="btn-premium-indigo" onClick={async () => {
                                const e = document.getElementById('whitelist-email') as HTMLInputElement;
                                if (!e.value) return;
                                try { await api.post("/instructor/whitelist-student", { email: e.value }); toast.success("Whitelisted!"); e.value = ""; fetchData(); } 
                                catch (err) { toast.error("Failed."); }
                            }}>Add to Cohort</button>
                          </div>
                        </Card>
                      </div>

                      <div style={{ padding: "1.5rem" }}>
                        <Card className="obsidian-card">
                          <div className="flex items-center gap-3 mb-6">
                            <UserPlus size={20} color="#6366f1" />
                            <h4 style={{ fontWeight: 700 }}>Staff Collaboration</h4>
                          </div>
                          <div className="flex flex-col gap-2">
                            <input id="assistant-email" placeholder="assistant@devoria.com" className="terminal-input w-full p-4 rounded-xl" style={{ outline: "none" }} />
                            <button className="btn-premium-indigo" onClick={async () => {
                                const e = document.getElementById('assistant-email') as HTMLInputElement;
                                if (!e.value) return;
                                try { await api.post("/instructor/invite-assistant", { email: e.value }); toast.success("Invited!"); e.value = ""; fetchData(); } 
                                catch (err) { toast.error("Failed."); }
                            }}>Invite Assistant</button>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                      <div style={{ padding: 0, overflow: "hidden" }}>
                        <Card className="obsidian-card">
                            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                                <h4 className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Active Whitelist Registry</h4>
                            </div>
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                  <thead style={{ background: "rgba(0,0,0,0.02)", textAlign: "left" }}>
                                      <tr>
                                          <th style={{ padding: "0.75rem 1.5rem" }}>Email</th>
                                          <th style={{ padding: "0.75rem 1.5rem" }}>Role</th>
                                          <th style={{ padding: "0.75rem 1.5rem" }}>Status</th>
                                          <th style={{ padding: "0.75rem 1.5rem", textAlign: "right" }}>Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {whitelist.map((item) => (
                                          <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                              <td style={{ padding: "1rem 1.5rem" }}>{item.email}</td>
                                              <td style={{ padding: "1rem 1.5rem" }}><span style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>{item.role}</span></td>
                                              <td style={{ padding: "1rem 1.5rem" }}>
                                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.is_used ? "#10b981" : "#f59e0b" }} />
                                                      <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{item.is_used ? "Registered" : "Pending"}</span>
                                                  </div>
                                              </td>
                                              <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                  <button onClick={() => handleRemoveWhitelist(item.email)} className="btn btn-ghost" style={{ color: "var(--color-error)" }}><X size={14} /></button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Create Class Modal */}
      {showClassModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <div style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
            <Card className="animate-fade-in">
              <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                <h3 className="text-h3">Create Class</h3>
                <button onClick={() => setShowClassModal(false)} style={{ background: "none", border: "none" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateClass} className="flex-column gap-2">
                <input required placeholder="Class Name" value={classForm.class_name} onChange={e => setClassForm({...classForm, class_name: e.target.value})} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
                <button type="submit" className="btn btn-primary">Create Class</button>
              </form>
            </Card>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
