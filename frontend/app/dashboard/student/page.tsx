"use client";

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
  Link as LinkIcon
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // Project Showcase Form
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: "", description: "", github_link: "", demo_link: "" });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      console.log("Fetching student data...");
      
      const [classRes, projectRes, attendRes, statusRes, submissionRes] = await Promise.all([
        api.get("/classes/student").catch(e => { console.error("Classes fetch failed", e); return { data: [] }; }),
        api.get("/projects/me").catch(e => { console.error("Projects fetch failed", e); return { data: [] }; }),
        api.get("/attendance/me").catch(e => { console.error("Attendance fetch failed", e); return { data: [] }; }),
        api.get("/classes/status").catch(e => { console.error("Status fetch failed", e); return { data: { has_approved: false, has_pending: false } }; }),
        api.get("/submissions/me").catch(e => { console.error("Submissions fetch failed", e); return { data: [] }; })
      ]);
      
      console.log("Classes found:", classRes.data?.length);
      console.log("Submissions found:", submissionRes.data?.length);
      
      setClasses(classRes.data || []);
      setProjects(projectRes.data || []);
      setAttendance(attendRes.data || []);
      setEnrollmentStatus(statusRes.data || { has_approved: false, has_pending: false });
      setSubmissions(submissionRes.data || []);
    } catch (err) {
      console.error("Dashboard sync error:", err);
      // toast.error("Failed to sync environment data.");
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
    } catch (err) {
       toast.error("Showcase submission failed.");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
       <div className="animate-pulse" style={{ color: "var(--color-primary)", fontWeight: 800 }}>Syncing Workspace...</div>
    </div>
  );

  const totalAssignments = classes.reduce((acc, c) => acc + (c.assignments?.length || 0), 0);
  const completedAssignments = submissions.length;
  const percentComplete = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  return (
    <>
      <Navbar />
      <main className="app-container" style={{ padding: "4rem 0", flexGrow: 1 }}>
        <section className="container">
          <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom: "3rem" }}>
              <div>
                <h1 className="text-h1">Student Dashboard</h1>
                <p className="text-body" style={{ opacity: 0.7 }}>Welcome back, {user?.first_name}. Your workspace is active.</p>
              </div>
              <div className="flex gap-1">
                 <div style={{ textAlign: "right", marginRight: "1.5rem" }}>
                    <p className="text-small" style={{ fontWeight: 800, opacity: 0.4 }}>PLATFORM RANK</p>
                    <h4 style={{ color: "var(--color-primary)", fontWeight: 900 }}>ENGINEER</h4>
                 </div>
              </div>
            </div>

            {(enrollmentStatus.has_approved || classes.length > 0 || enrollmentStatus.has_pending) && (
              <>
                <div className="grid-cols-3 gap-2" style={{ marginBottom: "3rem" }}>
                  <Card style={{ padding: "1rem" }}>
                    <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                      <span className="text-small" style={{ fontWeight: 600 }}>Overall Progress</span>
                      <Award size={16} color="var(--color-primary)" />
                    </div>
                    <h2 className="text-h2" style={{ fontSize: "1.75rem" }}>{percentComplete.toFixed(0)}%</h2>
                    <div style={{ marginTop: "0.5rem" }}>
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
                </div>

                {/* Academic/Submission Section */}
                <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                  <h3 className="text-h3" style={{ fontSize: "1.25rem", fontWeight: 800 }}>Recent Submissions & Grades</h3>
                </div>
                <div className="flex-column gap-1" style={{ marginBottom: "4rem" }}>
                   {submissions.length > 0 ? submissions.slice(0, 5).map((s: any) => (
                      <Card key={s.id} style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                             <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.1)", color: "var(--color-accent-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle size={18} />
                             </div>
                             <div>
                                <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.assignment?.title}</h4>
                                <p className="text-small" style={{ fontSize: "0.7rem", opacity: 0.5 }}>Submitted on {new Date(s.submitted_at).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                             <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--color-primary)" }}>{s.score || "—"}</div>
                             <label className="text-small" style={{ fontSize: "0.6rem", fontWeight: 800, opacity: 0.4 }}>GRADE</label>
                          </div>
                      </Card>
                   )) : (
                      <Card style={{ padding: "3rem", textAlign: "center", opacity: 0.4 }}>
                         <FileText size={48} style={{ margin: "0 auto 1rem" }} />
                         <p>No coursework submitted yet.</p>
                      </Card>
                   )}
                </div>

                <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                  <h3 className="text-h3" style={{ fontSize: "1.25rem", fontWeight: 800 }}>Active Learning Environments</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowJoinModal(true)}><Plus size={16} /> Join New</button>
                </div>

                <div className="grid-cols-3 gap-2">
                  {classes.length > 0 ? (
                    classes.map((cls: any) => (
                      <Card key={cls.id} className="animate-fade-in hover-lift" style={{ padding: "1.5rem", position: "relative", border: "1px solid var(--color-border)" }}>
                        <div style={{ position: "absolute", top: 0, right: 0, padding: "0.5rem 1rem", background: "var(--color-primary-light)", color: "var(--color-primary)", borderBottomLeftRadius: "1rem" }}>
                          <span className="text-small" style={{ fontWeight: 800, fontSize: "0.6rem" }}>{cls.track?.toUpperCase()}</span>
                        </div>
                        <h4 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--color-text)" }}>{cls.class_name}</h4>
                        <div style={{ marginBottom: "1.5rem" }}>
                           <p className="text-small" style={{ fontSize: "0.7rem", opacity: 0.5, fontWeight: 700 }}>COHORT STATUS: ACTIVE</p>
                        </div>
                        <button 
                          className="btn btn-primary" 
                          style={{ width: "100%", fontWeight: 700 }}
                          onClick={() => router.push(`/dashboard/student/class/${cls.id}`)}
                        >
                          Launch Workspace
                        </button>
                      </Card>
                    ))
                  ) : enrollmentStatus.has_pending ? (
                    <Card style={{ gridColumn: "span 3", padding: "4rem", textAlign: "center", background: "rgba(0,0,0,0.01)" }}>
                      <Clock size={48} style={{ marginBottom: "1rem", opacity: 0.1, margin: "0 auto" }} />
                      <h4 className="text-h3">Access Pending</h4>
                      <p className="text-body" style={{ maxWidth: "400px", margin: "1rem auto", opacity: 0.6 }}>
                        Your application is being reviewed. The instructor will grant access to the workspace shortly.
                      </p>
                    </Card>
                  ) : (
                    <Card style={{ gridColumn: "span 3", padding: "4rem", textAlign: "center", border: "2px dashed var(--color-border)" }}>
                      <Plus size={48} style={{ marginBottom: "1rem", opacity: 0.1, margin: "0 auto" }} />
                      <h4 className="text-h3">No Active Environments</h4>
                      <p className="text-small" style={{ marginBottom: "1.5rem", opacity: 0.6 }}>You are currently not enrolled in any cohorts.</p>
                      <button className="btn btn-primary" onClick={() => setShowJoinModal(true)}>Join a Cohort</button>
                    </Card>
                  )}
                </div>

                <div className="flex-between" style={{ marginTop: "4rem", marginBottom: "1.5rem" }}>
                    <h3 className="text-h3" style={{ fontSize: "1.25rem", fontWeight: 800 }}>Public Portfolio</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowProjectModal(true)}>Link New Work</button>
                </div>
                <div className="grid-cols-2 gap-2">
                   {projects.length > 0 ? projects.map((p: any) => (
                      <Card key={p.id} style={{ padding: "1.5rem", border: "1px solid var(--color-border)" }}>
                         <div className="flex-between" style={{ marginBottom: "1rem" }}>
                            <h4 style={{ fontWeight: 700 }}>{p.title}</h4>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                               <Link href={p.github_link} target="_blank" className="btn btn-ghost btn-sm"><LinkIcon size={14} /></Link>
                               <Link href={p.demo_link} target="_blank" className="btn btn-primary btn-sm">Demo</Link>
                            </div>
                         </div>
                         <p className="text-small" style={{ opacity: 0.7 }}>{p.description}</p>
                      </Card>
                   )) : (
                     <Card style={{ gridColumn: "span 2", padding: "3rem", textAlign: "center", opacity: 0.4 }}>
                        <p>No projects in your portfolio yet.</p>
                     </Card>
                   )}
                </div>
              </>
            )}

            {/* Application Section for new students */}
            {!enrollmentStatus.has_approved && !enrollmentStatus.has_pending && classes.length === 0 && (
               <Card style={{ padding: "3rem", textAlign: "center", border: "2px dashed var(--color-primary)", background: "rgba(37, 99, 235, 0.02)", marginTop: "3rem" }}>
                  <Users size={64} style={{ opacity: 0.1, margin: "0 auto 1.5rem" }} />
                  <h2 className="text-h2" style={{ marginBottom: "1rem" }}>Initialize Your Training</h2>
                  <p className="text-body" style={{ maxWidth: "600px", margin: "0 auto 2rem", opacity: 0.7 }}>
                    You haven't joined any class environments yet. Enter a class code provided by your instructor to begin your curriculum.
                  </p>
                  <button className="btn btn-primary btn-lg" onClick={() => setShowJoinModal(true)}>
                     <Plus size={20} /> Enter Class Code
                  </button>
               </Card>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {showJoinModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <Card style={{ maxWidth: "400px", width: "100%", padding: "2.5rem" }} className="animate-scale-in">
            <h3 className="text-h3" style={{ marginBottom: "1.5rem" }}>Enter Class Code</h3>
            <p className="text-small" style={{ marginBottom: "1.5rem", opacity: 0.6 }}>Your instructor will provide a 6-digit cryptographic code.</p>
            <form onSubmit={handleJoinClass} className="flex-column gap-3">
              <input required placeholder="E.G. AX792B" value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} style={{ padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", textAlign: "center", fontSize: "1.75rem", fontWeight: 900, letterSpacing: "0.25em" }} />
              <button type="submit" disabled={isJoining} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                 {isJoining ? "Syncing..." : "Submit Application"}
              </button>
              <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-ghost" style={{ width: "100%" }}>Cancel</button>
            </form>
          </Card>
        </div>
      )}

      {showProjectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
           <Card style={{ maxWidth: "450px", width: "100%", padding: "2.5rem" }} className="animate-scale-in">
            <h3 className="text-h3" style={{ marginBottom: "1.5rem" }}>New Portfolio Entry</h3>
            <form onSubmit={handleProjectSubmit} className="flex-column gap-3">
              <input required placeholder="Project Name" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
              <textarea required placeholder="Technical Overview" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows={3} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", resize: "none" }} />
              <input required placeholder="GitHub URL" value={projectForm.github_link} onChange={e => setProjectForm({...projectForm, github_link: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
              <input required placeholder="Live Demo URL" value={projectForm.demo_link} onChange={e => setProjectForm({...projectForm, demo_link: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
              <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>Publish to Portfolio</button>
              <button type="button" onClick={() => setShowProjectModal(false)} className="btn btn-ghost" style={{ width: "100%" }}>Cancel</button>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </>
  );
}
