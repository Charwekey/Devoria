"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  ChevronLeft, 
  Plus, 
  Download, 
  FileText,
  UserCheck,
  Award,
  BookOpen,
  MoreVertical,
  Trash2,
  Edit
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import toast from "react-hot-toast";

export default function InstructorClassEnvironment() {
  const { user, loading } = useAuth();
  const { id: classId } = useParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("roster");
  const [classData, setClassData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // States for marking attendance
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // States for Grading
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);

  // State for Assignment Form
  const [assnForm, setAssnForm] = useState({ title: "", description: "", deadline: "", file_url: "N/A" });

  const fetchData = async () => {
    try {
      const [clsRes, analyticsRes, pendingRes, assnRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/classes/${classId}/analytics`),
        api.get(`/class_students/pending/${classId}`),
        api.get(`/assignments/class/${classId}`)
      ]);
      
      setClassData(clsRes.data);
      setAnalytics(analyticsRes.data);
      setPendingRequests(pendingRes.data || []);
      setAssignments(assnRes.data || []);
      
      if (assnRes.data?.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(assnRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load management environment", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "instructor") { router.push("/dashboard/student"); return; }
    fetchData();
  }, [user, loading, classId]);

  // Fetch submissions when assignment changes
  useEffect(() => {
    if (selectedAssignmentId) {
      api.get(`/submissions/assignment/${selectedAssignmentId}`)
        .then(r => setSubmissions(r.data || []))
        .catch(e => console.error("Failed to fetch submissions", e));
    }
  }, [selectedAssignmentId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/assignments/", { ...assnForm, class_id: classId });
      toast.success("Assignment posted!");
      setAssnForm({ title: "", description: "", deadline: "", file_url: "N/A" });
      fetchData();
    } catch (err) {
      toast.error("Failed to post assignment.");
    }
  };

  const markBulkAttendance = async (status: string) => {
    try {
      if (!analytics?.students) return;
      const promises = analytics.students.map((s: any) => 
        api.post("/attendance/", {
          class_id: classId,
          student_id: s.student_id,
          date: attendanceDate,
          status: status
        })
      );
      await Promise.all(promises);
      toast.success(`Marked all students as ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Some records failed. They might already be marked for today.");
    }
  };

  const handleGrade = async (subId: string, score: string) => {
    try {
      await api.put(`/submissions/${subId}/grade`, { grade: score, feedback: "Keep up the good work!" });
      toast.success("Grade updated!");
      fetchData(); // Refresh analytics to see new average
      
      // Update local submissions state
      setSubmissions(subs => subs.map(s => s.id === subId ? { ...s, score } : s));
    } catch (err) {
      toast.error("Failed to save grade.");
    }
  };

  if (pageLoading || !classData) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div className="text-body">Loading Management Portal...</div>
      </div>
    );
  }

  const tabs = [
    { id: "roster", label: "Roster & Progress", icon: Users },
    { id: "attendance", label: "Attendance Grid", icon: Calendar },
    { id: "grading", label: "Grading Center", icon: Award },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
  ];

  return (
    <div className="flex-column" style={{ minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, display: "flex", background: "#f8fafc" }}>
        {/* Management Sidebar */}
        <aside style={{ 
          width: "300px", 
          background: "white", 
          borderRight: "1px solid var(--color-border)",
          padding: "2rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          position: "sticky",
          top: 0,
          height: "calc(100vh - 64px)"
        }}>
          <div>
             <Link href="/dashboard/instructor" style={{ 
               display: "inline-flex", 
               alignItems: "center", 
               gap: "0.5rem", 
               color: "var(--color-text-subtle)", 
               textDecoration: "none",
               fontSize: "0.85rem",
               marginBottom: "1.5rem"
             }}>
               <ChevronLeft size={16} /> Dashboard
             </Link>
             <h2 className="text-h2" style={{ fontSize: "1.4rem", color: "var(--color-text)", lineHeight: 1.2 }}>{classData.class_name}</h2>
             <span style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.6 }}>MANAGING {analytics?.total_students || 0} STUDENTS</span>
          </div>

          <nav className="flex-column" style={{ gap: "0.5rem" }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "0.75rem",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  background: activeTab === tab.id ? "var(--color-primary-light)" : "transparent",
                  color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-subtle)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  transition: "all 0.2s"
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Quick Stats sidebar footer */}
          <div style={{ marginTop: "auto" }}>
             <Card style={{ padding: "1rem", background: "var(--color-primary)", color: "white" }}>
                <span className="text-small" style={{ opacity: 0.8, fontSize: "0.65rem", fontWeight: 700 }}>CLASS AVG PERFORMANCE</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                   {analytics?.students?.length > 0 
                     ? (analytics.students.reduce((acc: any, s: any) => acc + s.grade_average, 0) / analytics.students.length).toFixed(1)
                     : "0"}%
                </div>
             </Card>
          </div>
        </aside>

        {/* Workspace Content Area */}
        <section style={{ flexGrow: 1, padding: "2.5rem", maxWidth: "1300px", margin: "0 auto", width: "100%" }}>
          
          <div className="animate-fade-in">
            {activeTab === "roster" && (
              <>
                <div className="flex-between" style={{ marginBottom: "2rem" }}>
                  <div>
                    <h3 className="text-h2" style={{ fontSize: "1.75rem" }}>Roster & Analytics</h3>
                    <p className="text-small">Track individual student engagement and performance.</p>
                  </div>
                  {pendingRequests.length > 0 && (
                    <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: 700 }}>
                       {pendingRequests.length} Pending Enrollment Requests
                    </div>
                  )}
                </div>

                <div className="flex-column gap-2">
                  {analytics?.students?.map((s: any) => (
                    <Card key={s.student_id} style={{ padding: "1.25rem" }}>
                      <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                           <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                              {s.name.charAt(0)}
                           </div>
                           <div>
                              <h4 style={{ fontWeight: 700 }}>{s.name}</h4>
                              <p className="text-small" style={{ fontSize: "0.7rem", opacity: 0.6 }}>{s.track.toUpperCase()} STUDENT</p>
                           </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <span className="text-small" style={{ fontWeight: 600 }}>Avg Score: {s.grade_average}%</span>
                        </div>
                      </div>

                      <div className="grid-cols-2 gap-4">
                         <div>
                            <span className="text-small" style={{ fontSize: "0.65rem", fontWeight: 800, opacity: 0.5 }}>ATTENDANCE RATE ({s.attendance_rate}%)</span>
                            <ProgressBar percentage={s.attendance_rate} />
                         </div>
                         <div>
                            <span className="text-small" style={{ fontSize: "0.65rem", fontWeight: 800, opacity: 0.5 }}>ASSIGNMENT PERFORMANCE ({s.grade_average}%)</span>
                            <ProgressBar percentage={s.grade_average} />
                         </div>
                      </div>
                    </Card>
                  ))}
                  {(!analytics?.students || analytics.students.length === 0) && (
                    <div style={{ textAlign: "center", padding: "5rem" }}>
                      <Users size={64} style={{ opacity: 0.05, margin: "0 auto 1rem" }} />
                      <p className="text-small">No students in this cohort yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "attendance" && (
              <>
                <div className="flex-between" style={{ marginBottom: "2rem" }}>
                  <div>
                    <h3 className="text-h2" style={{ fontSize: "1.75rem" }}>Attendance Spreadsheet</h3>
                    <p className="text-small">Mark attendance for the entire class cohort.</p>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <input 
                      type="date" 
                      value={attendanceDate} 
                      onChange={e => setAttendanceDate(e.target.value)}
                      style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                    />
                    <button className="btn btn-primary" onClick={() => markBulkAttendance("present")}>All Present</button>
                    <button className="btn btn-ghost" style={{ color: "var(--color-error)" }} onClick={() => markBulkAttendance("absent")}>All Absent</button>
                  </div>
                </div>

                <Card style={{ padding: 0 }}>
                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                         <tr style={{ textAlign: "left", background: "rgba(0,0,0,0.02)" }}>
                            <th style={{ padding: "1rem" }}>Student Name</th>
                            <th style={{ padding: "1rem" }}>Track</th>
                            <th style={{ padding: "1rem", textAlign: "center" }}>Quick Action</th>
                         </tr>
                      </thead>
                      <tbody>
                        {analytics?.students?.map((s: any) => (
                          <tr key={s.student_id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                            <td style={{ padding: "1rem", fontWeight: 600 }}>{s.name}</td>
                            <td style={{ padding: "1rem" }}>{s.track}</td>
                            <td style={{ padding: "1rem", textAlign: "center" }}>
                               <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                  <button onClick={() => api.post("/attendance/", { class_id: classId, student_id: s.student_id, date: attendanceDate, status: "present" }).then(() => toast.success(`Marked ${s.name} present`))} className="btn btn-ghost" style={{ fontSize: "0.7rem", color: "var(--color-accent-green)" }}>PRESENT</button>
                                  <button onClick={() => api.post("/attendance/", { class_id: classId, student_id: s.student_id, date: attendanceDate, status: "absent" }).then(() => toast.success(`Marked ${s.name} absent`))} className="btn btn-ghost" style={{ fontSize: "0.7rem", color: "var(--color-error)" }}>ABSENT</button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </Card>
              </>
            )}

            {activeTab === "grading" && (
              <>
                <div className="flex-between" style={{ marginBottom: "2rem" }}>
                  <div>
                    <h3 className="text-h2" style={{ fontSize: "1.75rem" }}>Grading Center</h3>
                    <p className="text-small">Review work and calculate performance averages.</p>
                  </div>
                  <select 
                    value={selectedAssignmentId} 
                    onChange={e => setSelectedAssignmentId(e.target.value)}
                    style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", minWidth: "200px" }}
                  >
                    <option value="">Select Assignment</option>
                    {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>

                <div className="flex-column gap-2">
                   {submissions.length > 0 ? submissions.map(sub => (
                     <Card key={sub.id} style={{ padding: "1.25rem" }}>
                        <div className="flex-between">
                           <div>
                              <h4 style={{ fontWeight: 700 }}>{sub.student?.first_name} {sub.student?.last_name}</h4>
                              <p className="text-small" style={{ marginBottom: "1rem" }}>Submitted {new Date(sub.submitted_at).toLocaleString()}</p>
                              <Link href={sub.file_url} target="_blank" className="text-small" style={{ color: "var(--color-primary)", fontWeight: 700 }}>VIEW SUBMISSION</Link>
                           </div>
                           <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              <div style={{ textAlign: "right" }}>
                                 <input 
                                   defaultValue={sub.score || "0"} 
                                   onBlur={(e) => handleGrade(sub.id, e.target.value)}
                                   placeholder="Score"
                                   style={{ width: "80px", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", textAlign: "center", fontWeight: 800, fontSize: "1.1rem" }}
                                 />
                                 <p className="text-small" style={{ fontSize: "0.6rem", textAlign: "center", marginTop: "0.25rem", opacity: 0.5 }}>SCORE / 100</p>
                              </div>
                           </div>
                        </div>
                     </Card>
                   )) : (
                     <div style={{ textAlign: "center", padding: "5rem" }}>
                        <Award size={48} style={{ opacity: 0.1, margin: "0 auto 1rem" }} />
                        <p>No submissions yet for this assignment.</p>
                     </div>
                   )}
                </div>
              </>
            )}

            {activeTab === "curriculum" && (
              <>
                <h3 className="text-h2" style={{ fontSize: "1.75rem", marginBottom: "2rem" }}>Manage Curriculum</h3>
                <div className="grid-cols-2 gap-2">
                   <Card style={{ padding: "2rem" }}>
                      <h4 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>Post New Assignment</h4>
                      <form onSubmit={handleCreateAssignment} className="flex-column gap-3">
                         <div className="flex-column gap-1">
                            <label className="text-small" style={{ fontWeight: 700 }}>TITLE</label>
                            <input required value={assnForm.title} onChange={e => setAssnForm({...assnForm, title: e.target.value})} placeholder="Assignment Title" style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
                         </div>
                         <div className="flex-column gap-1">
                            <label className="text-small" style={{ fontWeight: 700 }}>DESCRIPTION</label>
                            <textarea required value={assnForm.description} onChange={e => setAssnForm({...assnForm, description: e.target.value})} rows={4} placeholder="What should they build?" style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", resize: "none" }} />
                         </div>
                         <div className="flex-column gap-1">
                            <label className="text-small" style={{ fontWeight: 700 }}>DEADLINE</label>
                            <input required type="date" value={assnForm.deadline} onChange={e => setAssnForm({...assnForm, deadline: e.target.value})} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }} />
                         </div>
                         <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>Post to Cohort</button>
                      </form>
                   </Card>

                   <Card style={{ padding: "2rem" }}>
                      <h4 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>Active Materials</h4>
                      <div className="flex-column gap-2">
                         {assignments.map(a => (
                           <div key={a.id} className="flex-between glass-panel" style={{ padding: "1rem", borderRadius: "0.75rem" }}>
                              <div>
                                 <h5 style={{ fontWeight: 700 }}>{a.title}</h5>
                                 <p className="text-small" style={{ fontSize: "0.7rem" }}>Due {a.deadline}</p>
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                 <button className="btn btn-ghost" style={{ padding: "0.4rem" }}><Edit size={14} /></button>
                                 <button className="btn btn-ghost" style={{ padding: "0.4rem", color: "var(--color-error)" }}><Trash2 size={14} /></button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </Card>
                </div>
              </>
            )}
          </div>

        </section>
      </main>
      <Footer />
    </div>
  );
}
