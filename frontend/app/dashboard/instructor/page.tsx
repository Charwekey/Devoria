"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Users, FileText, CheckCircle, Plus, X, Copy, Check, UserMinus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function InstructorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Record<string, any[]>>({});
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ class_name: "", track: "frontend" });
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ class_id: "", title: "", description: "", file_url: "", deadline: "" });

  const fetchData = async () => {
    try {
      const clsRes = await api.get("/classes/instructor");
      const fetchedClasses = clsRes.data || [];
      setClasses(fetchedClasses);

      // Fetch pending requests for each class
      const requestsMap: Record<string, any[]> = {};
      await Promise.all(fetchedClasses.map(async (cls: any) => {
        try {
          const reqRes = await api.get(`/class_students/pending/${cls.id}`);
          requestsMap[cls.id] = reqRes.data || [];
        } catch (e) {
          console.error(`Failed to fetch requests for class ${cls.id}`, e);
        }
      }));
      setPendingRequests(requestsMap);
    } catch (err) {
      console.error("Failed to load instructor data", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "instructor") { router.push("/dashboard/student"); return; }
    fetchData();
  }, [user, loading, router]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/classes/", classForm);
      toast.success("Class created!");
      setShowClassModal(false);
      setClassForm({ class_name: "", track: user?.track || "frontend" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create class.");
    }
  };

  const handleApprove = async (classId: string, studentId: string) => {
    try {
      await api.post("/class_students/approve", { class_id: classId, student_id: studentId });
      toast.success("Student approved!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to approve student.");
    }
  };

  const handleDecline = async (classId: string, studentId: string) => {
    try {
      await api.delete(`/class_students/class/${classId}/student/${studentId}`);
      toast.success("Request declined.");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to decline request.");
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Class code copied!");
  };

  if (loading || !user) {
    return <div className="flex-center" style={{ minHeight: "100vh" }}><div className="text-body">Loading...</div></div>;
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "rgba(255, 255, 255, 0.4)", flexGrow: 1 }}>
        <section style={{ padding: "1.5rem 0" }}>
          <div className="container flex-column gap-2">

            {/* Header */}
            <div className="flex-between" style={{ flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <h1 className="text-h2" style={{ fontSize: "1.5rem" }}>Instructor Dashboard</h1>
                <p className="text-small">Manage cohorts, approve students, and create assignments.</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary" onClick={() => setShowClassModal(true)}><Plus size={16} /> Create Class</button>
              </div>
            </div>

            {dataLoading ? (
              <div className="grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <Card key={i}><div style={{ height: "60px", background: "rgba(0,0,0,0.03)", borderRadius: "0.5rem" }} /></Card>
                ))}
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid-cols-3 gap-2">
                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Active Classes</span>
                      <Users size={16} color="var(--color-primary)" />
                    </div>
                    <h2 className="text-h2" style={{ fontSize: "1.75rem" }}>{classes.length}</h2>
                    <p className="text-small">Cohorts managed</p>
                  </Card>

                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Track</span>
                      <FileText size={16} color="var(--color-accent-purple)" />
                    </div>
                    <h2 className="text-h2" style={{ fontSize: "1.75rem", textTransform: "capitalize" }}>{user.track}</h2>
                    <p className="text-small">Specialization</p>
                  </Card>

                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Role</span>
                      <CheckCircle size={16} color="var(--color-accent-green)" />
                    </div>
                    <h2 className="text-h2" style={{ fontSize: "1.75rem", textTransform: "capitalize" }}>{user.role}</h2>
                    <p className="text-small">Verified Instructor</p>
                  </Card>
                </div>

                {/* Optimized Class Grid */}
                <h3 className="text-h3" style={{ fontSize: "1.1rem", marginTop: "1rem" }}>My Cohorts</h3>
                <div className="grid-cols-3 gap-2" style={{ marginTop: "0.5rem" }}>
                  {classes.length > 0 ? (
                    classes.map((cls: any) => (
                      <Card key={cls.id} className="animate-fade-in dashboard-card" style={{ padding: "1.5rem", position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, right: 0, padding: "0.5rem", background: "var(--color-primary-light)", color: "var(--color-primary)", borderBottomLeftRadius: "1rem" }}>
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
                          className="btn btn-primary" 
                          style={{ width: "100%", padding: "0.6rem", fontSize: "0.85rem" }}
                          onClick={() => router.push(`/dashboard/instructor/class/${cls.id}`)}
                        >
                          Manage Environment
                        </button>
                      </Card>
                    ))
                  ) : (
                    <Card style={{ gridColumn: "span 3", padding: "3rem", textAlign: "center", border: "2px dashed var(--color-border)" }}>
                      <Plus size={48} style={{ marginBottom: "1rem", opacity: 0.2, margin: "0 auto" }} />
                      <h4 className="text-h3">Ready to start?</h4>
                      <p className="text-small" style={{ maxWidth: "400px", margin: "0.5rem auto", marginBottom: "1.5rem" }}>
                        Create your first class cohort to start tracking attendance and assignments.
                      </p>
                      <button className="btn btn-primary" onClick={() => setShowClassModal(true)}>Create Your First Class</button>
                    </Card>
                  )}
                </div>

                {/* Shared Requests Drawer (Quick lookup) */}
                {Object.values(pendingRequests).flat().length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <Card style={{ padding: "1.25rem", borderLeft: "4px solid var(--color-error)" }}>
                      <h3 className="text-h3" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Priority Alerts: Pending Requests</h3>
                      <div className="grid-cols-2 gap-2">
                         {classes.map((cls) => (
                            pendingRequests[cls.id]?.map((req: any) => (
                              <div key={`${cls.id}-${req.id}`} className="flex-between glass-panel" style={{ padding: "1rem", borderRadius: "0.5rem" }}>
                                <div>
                                  <h4 style={{ fontWeight: 600, fontSize: "0.85rem" }}>{req.first_name} {req.last_name}</h4>
                                  <p className="text-small" style={{ fontSize: "0.7rem" }}>Class: {cls.class_name}</p>
                                </div>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button className="btn btn-primary btn-sm" onClick={() => handleApprove(cls.id, req.id)}>Approve</button>
                                  <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => handleDecline(cls.id, req.id)}>Decline</button>
                                </div>
                              </div>
                            ))
                         ))}
                      </div>
                    </Card>
                  </div>
                )}

              </>
            )}
          </div>
        </section>
      </main>

      {/* Create Class Modal */}
      {showClassModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <Card style={{ maxWidth: "400px", width: "100%", padding: "2rem" }} className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
              <h3 className="text-h3">Create Class</h3>
              <button onClick={() => setShowClassModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateClass} className="flex-column gap-2">
              <input required placeholder="Class Name (e.g. Frontend Cohort A)" value={classForm.class_name} onChange={e => setClassForm({...classForm, class_name: e.target.value})} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
              <select value={classForm.track} onChange={e => setClassForm({...classForm, track: e.target.value})} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }}>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Fullstack</option>
              </select>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>Create Class</button>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </>
  );
}

const Clock = ({ size, style }: { size?: number, style?: any }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
