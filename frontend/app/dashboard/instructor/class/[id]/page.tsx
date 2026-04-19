"use client";

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
  Monitor
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InstructorClassManagement({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = use(params);
  const [activeTab, setActiveTab] = useState("roster");
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Student State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "" });

  // Create Assignment State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assnForm, setAssnForm] = useState({ title: "", description: "", deadline: "", is_final_project: false });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const [analyticsRes, pendingRes, assnRes] = await Promise.all([
        api.get(`/classes/${classId}/analytics`),
        api.get(`/classes/${classId}/pending`),
        api.get(`/assignments/class/${classId}`)
      ]);
      setAnalytics(analyticsRes.data);
      setPendingRequests(pendingRes.data);
      setAssignments(assnRes.data);
    } catch (err) {
      toast.error("Failed to sync environment.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId: string) => {
    try {
      await api.post(`/classes/${classId}/approve/${studentId}`);
      toast.success("Enrollment confirmed!");
      fetchClassData();
    } catch (err) {
      toast.error("Approval failed.");
    }
  };

  const handleDecline = async (studentId: string) => {
    try {
      await api.post(`/classes/${classId}/decline/${studentId}`);
      toast.success("Request removed.");
      fetchClassData();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("class_id", classId);
      formData.append("title", assnForm.title);
      formData.append("description", assnForm.description);
      formData.append("deadline", assnForm.deadline);
      formData.append("is_final_project", assnForm.is_final_project ? "1" : "0");
      if (selectedFile) formData.append("file", selectedFile);

      await api.post("/assignments/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Resources uploaded and curriculum updated.");
      setAssnForm({ title: "", description: "", deadline: "", is_final_project: false });
      setSelectedFile(null);
      fetchClassData();
    } catch (err) {
      toast.error("Failed to post assignment.");
    } finally {
      setIsPosting(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Permanently retract these materials?")) return;
    try {
       await api.delete(`/assignments/${id}`);
       toast.success("Curriculum updated.");
       fetchClassData();
    } catch (err) {
       toast.error("Deletion failed.");
    }
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setEditForm({
        first_name: student.name.split(' ')[0] || "",
        last_name: student.name.split(' ')[1] || "",
        email: student.email || ""
    });
    setShowEditModal(true);
  };

  const submitEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.put("/instructor/update-student", {
            student_id: selectedStudent.student_id,
            ...editForm
        });
        toast.success("Student updated successfully!");
        setShowEditModal(false);
        fetchClassData();
    } catch (err: any) {
        toast.error(err.response?.data?.detail || "Update failed");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("DANGER: This will permanently delete this student's account and data. Proceed?")) return;
    try {
        await api.delete(`/instructor/delete-student/${studentId}`);
        toast.success("Student deleted from platform.");
        fetchClassData();
    } catch (err) {
        toast.error("Action failed.");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="animate-pulse">Syncing Environment...</div>
    </div>
  );

  return (
    <div className="app-container" style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ display: "flex", flexDirection: "column" }}>
        {/* Class Hero */}
        <section style={{ padding: "4rem 0 2rem", background: "linear-gradient(to bottom, rgba(37, 99, 235, 0.05), transparent)" }}>
          <div className="container">
             <div className="flex-between">
                <div className="animate-fade-in">
                   <Link href="/dashboard/instructor" className="text-small" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-primary)", marginBottom: "1rem", textDecoration: "none", fontWeight: 700 }}>
                      <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to Dashboard
                   </Link>
                   <h1 className="text-h1" style={{ fontSize: "2.5rem" }}>{analytics?.class_name}</h1>
                   <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
                      <div className="badge badge-blue">{analytics?.track?.toUpperCase()} TRACK</div>
                      <div className="flex-center gap-1 text-small" style={{ opacity: 0.6 }}>
                        <Users size={16} /> {analytics?.students?.length || 0} Students Enrolled
                      </div>
                   </div>
                </div>
                <div style={{ textAlign: "right" }}>
                   <div style={{ background: "white", padding: "1.5rem", borderRadius: "1rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
                      <p className="text-small" style={{ fontWeight: 800, opacity: 0.4, marginBottom: "0.5rem" }}>CLASS CODE</p>
                      <h2 style={{ fontSize: "2rem", letterSpacing: "0.2em", color: "var(--color-primary)", margin: 0, fontWeight: 900 }}>{analytics?.class_code}</h2>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <section style={{ display: "flex", borderTop: "1px solid var(--color-border)" }}>
          {/* Sidebar Nav */}
          <aside style={{ width: "260px", padding: "2.5rem 1.5rem", borderRight: "1px solid var(--color-border)", minHeight: "70vh" }}>
             <div className="flex-column gap-1">
                <button 
                  onClick={() => setActiveTab("roster")} 
                  className={`btn ${activeTab === "roster" ? "btn-primary" : "btn-ghost"}`}
                  style={{ justifyContent: "flex-start", gap: "1rem", fontSize: "0.9rem" }}
                >
                   <Users size={18} /> Student Roster
                </button>
                <button 
                  onClick={() => setActiveTab("attendance")} 
                  className={`btn ${activeTab === "attendance" ? "btn-primary" : "btn-ghost"}`}
                  style={{ justifyContent: "flex-start", gap: "1rem", fontSize: "0.9rem" }}
                >
                   <Calendar size={18} /> Attendance
                </button>
                <button 
                  onClick={() => setActiveTab("grading")} 
                  className={`btn ${activeTab === "grading" ? "btn-primary" : "btn-ghost"}`}
                  style={{ justifyContent: "flex-start", gap: "1rem", fontSize: "0.9rem" }}
                >
                   <Award size={18} /> Academic Results
                </button>
                <button 
                  onClick={() => setActiveTab("curriculum")} 
                  className={`btn ${activeTab === "curriculum" ? "btn-primary" : "btn-ghost"}`}
                  style={{ justifyContent: "flex-start", gap: "1rem", fontSize: "0.9rem" }}
                >
                   <FileText size={18} /> Course Materials
                </button>
             </div>
             
             <div style={{ marginTop: "4rem" }}>
                <Card style={{ padding: "1.25rem", background: "white", border: "1px solid var(--color-border)" }}>
                   <p className="text-small" style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Cohort Health</p>
                   <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                      {analytics?.students?.length > 0 
                        ? (analytics.students.reduce((acc: any, s: any) => acc + s.grade_average, 0) / analytics.students.length).toFixed(0)
                        : "0"}%
                   </div>
                </Card>
             </div>
          </aside>

          {/* Workspace */}
          <section style={{ flexGrow: 1, padding: "2.5rem", maxWidth: "1300px", margin: "0 auto", width: "100%" }}>
            
            <div className="animate-fade-in">
              {activeTab === "roster" && (
                <>
                  <div className="flex-between" style={{ marginBottom: "2.5rem" }}>
                    <div>
                      <h3 className="text-h2" style={{ fontSize: "1.75rem" }}>Intelligent Roster</h3>
                      <p className="text-small" style={{ opacity: 0.6 }}>Analyze engagement and assignment performance metrics.</p>
                    </div>
                  </div>

                  {pendingRequests.length > 0 && (
                    <Card style={{ padding: "1.5rem", borderLeft: "4px solid var(--color-error)", marginBottom: "2.5rem" }}>
                      <h4 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>Pending Access Requests ({pendingRequests.length})</h4>
                      <div className="grid-cols-2 gap-3">
                        {pendingRequests.map((req: any) => (
                           <div key={req.id} className="flex-between glass-panel" style={{ padding: "1.25rem", borderRadius: "1rem" }}>
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: "1rem" }}>{req.first_name} {req.last_name}</h4>
                                <p className="text-small" style={{ opacity: 0.5 }}>{req.email}</p>
                              </div>
                              <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id)}>Accept</button>
                                <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => handleDecline(req.id)}>Deny</button>
                              </div>
                           </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <div className="flex-column gap-3">
                    {analytics?.students?.map((s: any) => (
                      <Card key={s.student_id} style={{ padding: "1.5rem", border: "1px solid var(--color-border)" }}>
                        <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                             <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem" }}>
                                {s.name.charAt(0)}
                             </div>
                             <div>
                                <h4 style={{ fontWeight: 800, fontSize: "1.1rem" }}>{s.name}</h4>
                                <p className="text-small" style={{ fontSize: "0.75rem", opacity: 0.5, fontWeight: 700 }}>{s.track.toUpperCase()} STUDENT</p>
                             </div>
                          </div>
                          
                          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                             <button className="btn btn-ghost btn-sm" onClick={() => handleEditStudent(s)} style={{ padding: "0.5rem" }}><Edit size={18} /></button>
                             <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)", padding: "0.5rem" }} onClick={() => handleRemoveStudent(s.student_id)}><Trash2 size={18} /></button>
                             
                             <div style={{ width: "1px", height: "30px", background: "var(--color-border)", margin: "0 0.5rem" }} />
                             
                             <div style={{ textAlign: "right" }}>
                                <span className="text-small" style={{ fontWeight: 800, color: "var(--color-primary-dark)" }}>Avg Score: {s.grade_average}%</span>
                             </div>
                          </div>
                        </div>

                        <div className="grid-cols-2 gap-4">
                           <div>
                              <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                 <label className="text-small" style={{ fontWeight: 800, opacity: 0.4 }}>ATTENDANCE RATE ({s.attendance_rate}%)</label>
                                 <span className="text-small" style={{ opacity: 0.5 }}>{s.present_count} Classes Attended</span>
                              </div>
                              <ProgressBar percentage={s.attendance_rate} />
                           </div>
                           <div>
                              <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                                 <label className="text-small" style={{ fontWeight: 800, opacity: 0.4 }}>ASSIGNMENT PERFORMANCE ({s.grade_average}%)</label>
                              </div>
                              <ProgressBar percentage={s.grade_average} />
                           </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "attendance" && (
                <>
                  <div className="flex-between" style={{ marginBottom: "2rem" }}>
                    <div>
                      <h3 className="text-h2" style={{ fontSize: "1.5rem" }}>Attendance Ledger</h3>
                      <p className="text-small">Verify daily logins and module engagement.</p>
                    </div>
                  </div>
                  {/* ... attendance content ... */}
                </>
              )}
            </div>
          </section>
        </section>
      </main>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
           <Card className="animate-fade-in" style={{ maxWidth: "450px", width: "100%", padding: "2.5rem" }}>
              <div className="flex-between" style={{ marginBottom: "2rem" }}>
                 <h3 className="text-h3">Update Account Details</h3>
                 <button onClick={() => setShowEditModal(false)} className="btn btn-ghost" style={{ padding: "0.5rem" }}><X size={20} /></button>
              </div>
              <form onSubmit={submitEditStudent} className="flex-column gap-3">
                 <div className="grid-cols-2 gap-2">
                    <div className="flex-column gap-1">
                        <label className="text-small" style={{ fontWeight: 700 }}>FIRST NAME</label>
                        <input required autoComplete="one-time-code" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
                    </div>
                    <div className="flex-column gap-1">
                        <label className="text-small" style={{ fontWeight: 700 }}>LAST NAME</label>
                        <input required autoComplete="one-time-code" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
                    </div>
                 </div>
                 <div className="flex-column gap-1">
                    <label className="text-small" style={{ fontWeight: 700 }}>EMAIL ADDRESS</label>
                    <input required autoComplete="one-time-code" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
                 </div>
                 <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>Commit Changes</button>
              </form>
           </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
