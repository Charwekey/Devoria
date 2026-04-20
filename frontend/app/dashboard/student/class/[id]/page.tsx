"use client";

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
  Download
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    demo_link: ""
  });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const [classRes, assignmentsRes, submissionsRes, attendanceRes, materialsRes] = await Promise.all([
        api.get(`/classes/${classId}`).catch(e => ({ data: null })),
        api.get(`/assignments/class/${classId}`).catch(e => ({ data: [] })),
        api.get(`/submissions/me`).catch(e => ({ data: [] })),
        api.get(`/attendance/me`).catch(e => ({ data: [] })),
        api.get(`/materials/class/${classId}`).catch(e => ({ data: [] }))
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

      await api.post("/submissions/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
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
    } catch (err) {
      toast.error("Retract failed.");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="animate-pulse" style={{ color: "var(--color-primary)", fontWeight: 800 }}>Initializing Workspace...</div>
    </div>
  );

  if (!classData) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <h2 className="text-h2">Environment Not Found</h2>
      <Link href="/dashboard/student" className="btn btn-primary">Return to Dashboard</Link>
    </div>
  );

  const averageScore = submissions.length > 0 
    ? submissions.reduce((acc, s) => acc + (parseInt(s.score) || 0), 0) / submissions.length
    : 0;

  const tabs = [
    { id: "assignments", label: "Curriculum", icon: FileText },
    { id: "materials", label: "Course Materials", icon: Download },
    { id: "submissions", label: "Submissions", icon: CheckCircle },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "showcase", label: "Portfolio", icon: Layout },
  ];

  return (
    <div className="app-container" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ display: "flex", flexDirection: "column" }}>
        {/* Class Header */}
        <section style={{ padding: "4rem 0 2rem", background: "linear-gradient(to bottom, rgba(37, 99, 235, 0.05), transparent)" }}>
          <div className="container">
             <div className="flex-between">
                <div className="animate-fade-in">
                   <Link href="/dashboard/student" className="text-small" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-primary)", marginBottom: "1rem", textDecoration: "none", fontWeight: 700 }}>
                      <ChevronLeft size={14} /> Back to Dashboard
                   </Link>
                   <h1 className="text-h1" style={{ fontSize: "2rem" }}>{classData.class_name}</h1>
                   <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
                      <div className="badge badge-blue">{classData.track?.toUpperCase()} TRACK</div>
                      <div className="flex-center gap-1 text-small" style={{ opacity: 0.6 }}>
                        <Clock size={16} /> 8 Week Interactive Cycle
                      </div>
                   </div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                   <div style={{ padding: "1.25rem 2rem", textAlign: "center", background: "white", boxShadow: "var(--shadow-sm)" }}>
                      <Card>
                         <label className="text-small" style={{ fontWeight: 800, opacity: 0.4, display: "block" }}>ATTENDANCE</label>
                         <h4 style={{ fontSize: "1.75rem", margin: 0, fontWeight: 900 }}>{attendance.length} {attendance.length === 1 ? "Class" : "Classes"}</h4>
                         <p className="text-small" style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--color-accent-green)" }}>ATTENDED</p>
                      </Card>
                   </div>
                   <div style={{ padding: "1.25rem 2rem", textAlign: "center", background: "white", boxShadow: "var(--shadow-sm)" }}>
                      <Card>
                         <label className="text-small" style={{ fontWeight: 800, opacity: 0.4, display: "block" }}>TOTAL TASKS</label>
                         <h4 style={{ fontSize: "1.75rem", margin: 0, fontWeight: 900 }}>{assignments.length}</h4>
                      </Card>
                   </div>
                   <div style={{ padding: "1.25rem 2rem", textAlign: "center", background: "white", boxShadow: "var(--shadow-sm)" }}>
                      <Card>
                         <label className="text-small" style={{ fontWeight: 800, opacity: 0.4, display: "block" }}>AVG GRADE</label>
                         <h4 style={{ fontSize: "1.75rem", margin: 0, fontWeight: 900, color: "var(--color-primary)" }}>{averageScore.toFixed(0)}%</h4>
                      </Card>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <section style={{ display: "flex", borderTop: "1px solid var(--color-border)" }}>
          {/* Sidebar Nav */}
          <aside style={{ width: "240px", padding: "2.5rem 1.5rem", borderRight: "1px solid var(--color-border)", minHeight: "60vh" }}>
             <div className="flex-column gap-1">
                {tabs.map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)} 
                     className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-ghost"}`}
                     style={{ justifyContent: "flex-start", gap: "1rem", padding: "0.8rem 1rem", fontSize: "0.9rem" }}
                   >
                      <tab.icon size={18} /> {tab.label}
                   </button>
                ))}
             </div>
          </aside>

          {/* Workspace */}
          <section style={{ flexGrow: 1, padding: "2.5rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            
            <div className="animate-fade-in">
              {activeTab === "assignments" && (
                <>
                  <div className="flex-between" style={{ marginBottom: "2rem" }}>
                    <div>
                      <h3 className="text-h2" style={{ fontSize: "1.75rem" }}>Curriculum Path</h3>
                      <p className="text-small">Complete your upcoming tasks to advance.</p>
                    </div>
                  </div>

                  <div className="flex-column gap-2">
                    {assignments.filter(a => !submissions.find(s => s.assignment_id === a.id)).length > 0 ? 
                     assignments.filter(a => !submissions.find(s => s.assignment_id === a.id)).map((assn: any) => {
                      const isFinal = assn.is_final_project == 1;

                      return (
                        <div key={assn.id} style={{ padding: 0, borderLeft: isFinal ? "4px solid var(--color-accent-purple)" : "1px solid var(--color-border)" }}>
                          <Card>
                          <div 
                            className="flex-between" 
                            style={{ padding: "1.5rem", cursor: "pointer" }}
                            onClick={() => setExpandedId(expandedId === assn.id ? null : assn.id)}
                          >
                            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                               <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <FileText size={24} opacity={0.3} />
                               </div>
                               <div>
                                  <h4 style={{ fontWeight: 700 }}>
                                    {assn.title}
                                    {isFinal && <span style={{ marginLeft: "0.5rem", color: "var(--color-accent-purple)", fontSize: "0.6rem", fontWeight: 900 }}>FINAL</span>}
                                  </h4>
                                  <p className="text-small" style={{ fontSize: "0.75rem" }}>Deadline: {new Date(assn.deadline).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                               <span style={{ opacity: 0.4, fontWeight: 700, fontSize: "0.75rem" }}>PENDING</span>
                            </div>
                          </div>

                          {expandedId === assn.id && (
                            <div style={{ padding: "0 1.5rem 1.5rem", borderTop: "1px solid var(--color-border)", background: "rgba(0,0,0,0.01)" }}>
                               <div style={{ paddingTop: "1.5rem" }}>
                                  <div className="grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-small" style={{ fontWeight: 800, opacity: 0.4 }}>TASK OVERVIEW</label>
                                        <p style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{assn.description}</p>
                                        
                                        {assn.file_url && (
                                           <Link href={`http://localhost:8000${assn.file_url}`} target="_blank" className="btn btn-ghost btn-sm" style={{ marginTop: "1rem", color: "var(--color-primary)" }}>
                                              <Download size={14} /> Download Resources
                                           </Link>
                                        )}
                                     </div>

                                     <form onSubmit={(e) => handleSubmit(e, assn.id, isFinal)} className="flex-column gap-3" style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid var(--color-border)" }}>
                                          <h5 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{isFinal ? "Launch Your Project" : "Submit Work"}</h5>
                                          
                                          {isFinal ? (
                                             <>
                                                <input required placeholder="Project Master Title" value={submissionForm.project_title} onChange={e => setSubmissionForm({ ...submissionForm, project_title: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", width: "100%", fontSize: "0.85rem" }} />
                                                <input required placeholder="GitHub Repo URL" value={submissionForm.github_link} onChange={e => setSubmissionForm({ ...submissionForm, github_link: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", width: "100%", fontSize: "0.85rem" }} />
                                                <textarea required placeholder="Summary of tech stack..." rows={3} value={submissionForm.project_description} onChange={e => setSubmissionForm({ ...submissionForm, project_description: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", width: "100%", fontSize: "0.85rem", resize: "none" }} />
                                             </>
                                          ) : (
                                             <input placeholder="GitHub/Website URL" value={submissionForm.link} onChange={e => setSubmissionForm({ ...submissionForm, link: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", width: "100%", fontSize: "0.85rem" }} />
                                          )}
                                          
                                          <div className="flex-between" style={{ gap: "1rem" }}>
                                             <div style={{ flexGrow: 1, border: "2px dashed var(--color-border)", borderRadius: "0.5rem", padding: "0.5rem", textAlign: "center" }}>
                                                <input type="file" id={`sub-file-${assn.id}`} style={{ display: "none" }} onChange={e => setSubmissionFile(e.target.files?.[0] || null)} />
                                                <label htmlFor={`sub-file-${assn.id}`} style={{ cursor: "pointer", fontSize: "0.75rem", opacity: 0.7, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                                   <Upload size={14} /> {submissionFile ? submissionFile.name : "Capture Preview"}
                                                </label>
                                             </div>
                                             <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ minWidth: "140px" }}>
                                                {submitting ? "Processing..." : isFinal ? "Launch & Submit" : "Turn In"}
                                             </button>
                                          </div>
                                     </form>
                                  </div>
                               </div>
                            </div>
                          )}
                        </Card>
                        </div>
                      );
                    }) : (
                      <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5 }}>
                        <Check size={48} style={{ margin: "0 auto 1rem" }} />
                        <p>Module tasks completed!</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "submissions" && (
                <>
                  <h3 className="text-h2" style={{ fontSize: "1.75rem", marginBottom: "2rem" }}>Academic Record</h3>
                  <div className="flex-column gap-2">
                    {submissions.length > 0 ? submissions.map((sub: any) => (
                      <div key={sub.id} style={{ padding: "1.5rem" }}>
                        <Card>
                          <div className="flex-between">
                             <div style={{ display: "flex", gap: "1.5rem" }}>
                                <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "var(--color-accent-green)", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                   <CheckCircle size={20} />
                                </div>
                                <div>
                                   <h4 style={{ fontWeight: 700 }}>{sub.assignment?.title}</h4>
                                   <p className="text-small" style={{ opacity: 0.5 }}>Handed in {new Date(sub.submitted_at).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                                <div style={{ textAlign: "right" }}>
                                 <label className="text-small" style={{ fontWeight: 800, opacity: 0.4, display: "block" }}>SCORE</label>
                                 <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--color-primary)" }}>{sub.score || "—"}</span>
                              </div>
                              <button onClick={() => handleUnsubmit(sub.id)} className="btn btn-ghost" style={{ color: "var(--color-error)", padding: "0.5rem" }}><Trash2 size={16} /></button>
                           </div>
                        </div>
                      </Card>
                      </div>
                    )) : (
                      <div style={{ textAlign: "center", padding: "5rem", opacity: 0.2 }}>
                         <BarChart3 size={64} style={{ margin: "0 auto 1rem" }} />
                         <p>No submission records found.</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "materials" && (
                <>
                  <h3 className="text-h2" style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Course Materials</h3>
                  <p className="text-small" style={{ marginBottom: "1.5rem", opacity: 0.7 }}>Learning resources uploaded by your instructor.</p>
                  {materials.length > 0 ? (
                    <div className="flex-column gap-3">
                      {materials.map((material: any) => (
                        <div key={material.id}>
                          <Card>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{material.title}</h4>
                                <p className="text-small" style={{ opacity: 0.6, marginBottom: "0.75rem" }}>{material.description}</p>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>{material.material_type?.toUpperCase()}</span>
                                  <span className="text-small" style={{ opacity: 0.5 }}>
                                    Uploaded: {new Date(material.created_at || Date.now()).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {material.file_url && (
                                <Link 
                                  href={`http://localhost:8000${material.file_url}`} 
                                  target="_blank" 
                                  download
                                  className="btn btn-primary btn-sm" 
                                  style={{ marginLeft: "1rem", whiteSpace: "nowrap" }}
                                >
                                  <Download size={14} /> Download
                                </Link>
                              )}
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "4rem", textAlign: "center", opacity: 0.5 }}>
                      <FileText size={48} style={{ margin: "0 auto 1rem" }} />
                      <p>No course materials available yet.</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "attendance" && (
                <>
                  <h3 className="text-h2" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Record of Presence</h3>
                  <div style={{ padding: "0" }}>
                    <Card>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                          <th style={{ padding: "1rem", textAlign: "left" }} className="text-small">Date</th>
                          <th style={{ padding: "1rem", textAlign: "left" }} className="text-small">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length > 0 ? attendance.map(item => (
                          <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "1rem" }}>{new Date(item.date).toLocaleDateString()}</td>
                            <td style={{ padding: "1rem" }}>
                              <span style={{ 
                                padding: "0.25rem 0.5rem", 
                                borderRadius: "1rem", 
                                fontSize: "0.75rem", 
                                fontWeight: 700,
                                background: item.status === "present" ? "#dcfce7" : "#fee2e2",
                                color: item.status === "present" ? "#166534" : "#991b1b"
                              }}>
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={2} style={{ padding: "3rem", textAlign: "center", opacity: 0.4 }}>No logs found for this cycle.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    </Card>
                  </div>
                </>
              )}

              {activeTab === "showcase" && (
                <>
                  <h3 className="text-h2" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Your Showcase Portfolio</h3>
                  <div className="grid-cols-2 gap-2">
                    {submissions.filter(s => s.assignment?.is_final_project == 1).length > 0 ? 
                      submissions.filter(s => s.assignment?.is_final_project == 1).map(sub => (
                      <div key={sub.id} style={{ padding: "1.5rem", border: "1px solid var(--color-border)" }}>
                        <Card>
                           <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                               {sub.student?.first_name?.[0]}
                            </div>
                            <div style={{ flexGrow: 1 }}>
                               <h4 style={{ fontWeight: 700 }}>{sub.project_title}</h4>
                               <p className="text-small" style={{ opacity: 0.6 }}>{sub.assignment?.title}</p>
                            </div>
                         </div>
                         <p className="text-small" style={{ marginBottom: "1.5rem", height: "3.5rem", overflow: "hidden" }}>{sub.project_description}</p>
                         <div className="flex gap-2">
                            <Link href={sub.github_link || "#"} target="_blank" className="btn btn-ghost btn-sm"><LinkIcon size={14} /></Link>
                            <Link href={sub.demo_link || "#"} target="_blank" className="btn btn-primary btn-sm"><ExternalLink size={14} /> View Demo</Link>
                         </div>
                        </Card>
                      </div>
                    )) : (
                      <div style={{ gridColumn: "span 2", padding: "4rem", textAlign: "center", opacity: 0.5 }}>
                        <Card>
                          <Award size={48} style={{ margin: "0 auto 1rem" }} />
                          <p>No final projects submitted yet.</p>
                        </Card>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
