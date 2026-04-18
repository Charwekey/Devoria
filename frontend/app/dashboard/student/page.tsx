"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BookOpen, Calendar, CheckSquare, Upload, Plus, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Forms
  const [projectForm, setProjectForm] = useState({ title: "", description: "", github_link: "", demo_link: "" });
  const [classCode, setClassCode] = useState("");

  const [enrollmentStatus, setEnrollmentStatus] = useState({ has_pending: false, has_approved: false });

  const fetchData = async () => {
    try {
      // Individual safe loaders to prevent one failure from crashing the whole dashboard
      const safeGet = async (url: string) => {
        try { return (await api.get(url)).data; } catch { return []; }
      };

      const [assnData, attData, projData, classData, statusData] = await Promise.all([
        safeGet("/assignments/"),
        safeGet("/attendance/me"),
        safeGet("/projects/me"),
        safeGet("/classes/student"),
        api.get("/classes/status").then(r => r.data).catch(() => ({ has_pending: false, has_approved: false }))
      ]);

      setAssignments(assnData || []);
      setAttendance(attData || []);
      setProjects(projData || []);
      setClasses(classData || []);
      setEnrollmentStatus(statusData);
    } catch (err: any) {
      console.error("Critical dashboard load failure", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "student") { router.push("/dashboard/instructor"); return; }
    fetchData();
  }, [user, loading, router]);

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/projects/", projectForm);
      toast.success("Project submitted!");
      setShowProjectModal(false);
      setProjectForm({ title: "", description: "", github_link: "", demo_link: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit project.");
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/classes/join", { class_code: classCode });
      toast.success(res.data.message || "Request sent!");
      setShowJoinModal(false);
      setClassCode("");
      fetchData();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 500) {
        toast.error("Server synchronization error. Please try again in a moment.");
      } else {
        toast.error(detail || "Failed to join class. Please check the code.");
      }
    }
  };

  if (loading || !user) {
    return <div className="flex-center" style={{ minHeight: "100vh" }}><div className="text-body">Loading...</div></div>;
  }

  const assignmentCount = assignments.length;
  const percentComplete = assignmentCount > 0 ? Math.round((projects.length / assignmentCount) * 100) : 0;

  return (
    <>
      <Navbar />
      <main style={{ background: "rgba(255, 255, 255, 0.4)", flexGrow: 1 }}>
        <section style={{ padding: "1.5rem 0" }}>
          <div className="container flex-column gap-2">

            {/* Compact Header with Track Info */}
            <div className="flex-between" style={{ flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  <h1 className="text-h2" style={{ fontSize: "1.5rem", margin: 0 }}>Hi, {user.first_name} ✨</h1>
                  <span style={{ 
                    padding: "0.2rem 0.6rem", 
                    background: "var(--color-primary-light)", 
                    color: "var(--color-primary)", 
                    borderRadius: "1rem", 
                    fontSize: "0.7rem", 
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    {user.track} Student
                  </span>
                </div>
                <p className="text-small">Track your learning journey and projects.</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }} onClick={() => setShowJoinModal(true)}>
                  <Plus size={16} /> Join Class
                </button>
                <button className="btn btn-primary" style={{ padding: "0.5rem 1rem" }} onClick={() => setShowProjectModal(true)}>
                  <Upload size={16} /> Submit Project
                </button>
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
                {/* Compact Stats */}
                <div className="grid-cols-3 gap-2">
                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Learning Progress</span>
                      <CheckSquare size={16} color="var(--color-primary)" />
                    </div>
                    <div className="flex-between" style={{ alignItems: "flex-end" }}>
                      <h2 className="text-h2" style={{ margin: 0, fontSize: "1.75rem" }}>{percentComplete}%</h2>
                      <span className="text-small">{projects.length}/{assignmentCount} done</span>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                       <ProgressBar percentage={percentComplete} />
                    </div>
                  </Card>

                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Attendance</span>
                      <Calendar size={16} color="var(--color-accent-green)" />
                    </div>
                    <h2 className="text-h2" style={{ fontSize: "1.75rem" }}>{attendance.length}</h2>
                    <p className="text-small">Sessions recorded</p>
                  </Card>

                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Projects</span>
                      <BookOpen size={16} color="var(--color-accent-purple)" />
                    </div>
                    <h2 className="text-h2" style={{ fontSize: "1.75rem" }}>{projects.length}</h2>
                    <p className="text-small">Showcased works</p>
                  </Card>
                </div>                <h3 className="text-h3" style={{ fontSize: "1.1rem", marginTop: "1rem" }}>My Joined Classes</h3>
                <div className="grid-cols-3 gap-2" style={{ marginTop: "0.5rem" }}>
                  {classes.length > 0 ? (
                    classes.map((cls: any) => (
                      <Card key={cls.id} className="animate-fade-in dashboard-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, right: 0, padding: "0.5rem", background: "var(--color-primary-light)", color: "var(--color-primary)", borderBottomLeftRadius: "1rem" }}>
                          <span className="text-small" style={{ fontWeight: 800, fontSize: "0.6rem" }}>{cls.track?.toUpperCase()}</span>
                        </div>
                        <BookOpen size={24} color="var(--color-primary)" style={{ marginBottom: "1rem" }} />
                        <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{cls.class_name}</h4>
                        <p className="text-small" style={{ marginBottom: "1.5rem", opacity: 0.7 }}>Instructor ID: {cls.instructor_id.split("-")[0]}...</p>
                        
                        <button 
                          className="btn btn-primary" 
                          style={{ width: "100%", padding: "0.5rem", fontSize: "0.8rem" }}
                          onClick={() => router.push(`/dashboard/student/class/${cls.id}`)}
                        >
                          Enter Class
                        </button>
                      </Card>
                    ))
                  ) : enrollmentStatus.has_pending ? (
                    <Card style={{ gridColumn: "span 3", padding: "3rem", textAlign: "center" }}>
                      <Clock size={48} style={{ marginBottom: "1rem", opacity: 0.2, margin: "0 auto" }} />
                      <h4 className="text-h3">Pending Approval</h4>
                      <p className="text-small" style={{ maxWidth: "400px", margin: "0.5rem auto" }}>
                        You've applied to a class! Please wait for the instructor to approve your request.
                      </p>
                    </Card>
                  ) : (
                    <Card style={{ gridColumn: "span 3", padding: "3rem", textAlign: "center", border: "2px dashed var(--color-border)" }}>
                      <Plus size={48} style={{ marginBottom: "1rem", opacity: 0.2, margin: "0 auto" }} />
                      <h4 className="text-h3">No Classes Joined</h4>
                      <p className="text-small" style={{ maxWidth: "400px", margin: "0.5rem auto", marginBottom: "1.5rem" }}>
                        You haven't joined any classes yet. Use a code provided by your instructor to get started.
                      </p>
                      <button className="btn btn-primary" onClick={() => setShowJoinModal(true)}>Join Your First Class</button>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {showJoinModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <Card style={{ maxWidth: "400px", width: "100%", padding: "2rem" }} className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
              <h3 className="text-h3">Join Class</h3>
              <button onClick={() => setShowJoinModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <p className="text-small" style={{ marginBottom: "1.5rem" }}>Enter the class code provided by your instructor.</p>
            <form onSubmit={handleJoinClass} className="flex-column gap-2">
              <input 
                required 
                placeholder="ABC-123" 
                value={classCode} 
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none", textAlign: "center", fontSize: "1.25rem", letterSpacing: "0.1em", fontWeight: 700 }} 
              />
              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>Join</button>
            </form>
          </Card>
        </div>
      )}

      {showProjectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
          <Card style={{ maxWidth: "440px", width: "100%", padding: "2rem" }} className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
              <h3 className="text-h3">Submit Project</h3>
              <button onClick={() => setShowProjectModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleProjectSubmit} className="flex-column gap-2">
              <input required placeholder="Project Title" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
              <textarea required placeholder="Brief Description" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows={3} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none", resize: "none" }} />
              <input required placeholder="GitHub URL" value={projectForm.github_link} onChange={e => setProjectForm({...projectForm, github_link: e.target.value})} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
              <input required placeholder="Demo URL (Vercel/Netlify)" value={projectForm.demo_link} onChange={e => setProjectForm({...projectForm, demo_link: e.target.value})} style={{ padding: "0.6rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
              <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>Post Project</button>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </>
  );
}
