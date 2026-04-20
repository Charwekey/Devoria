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
  const [attendance, setAttendance] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate 8-week class schedule (Monday, Wednesday, Friday)
  const generateClassSchedule = () => {
    const schedule = [];
    const startDate = new Date(); // Start from today, but we should ideally get class start date
    
    // Find the next Monday
    const nextMonday = new Date(startDate);
    nextMonday.setDate(startDate.getDate() + (1 - startDate.getDay() + 7) % 7);
    
    for (let week = 0; week < 8; week++) {
      // Monday
      const monday = new Date(nextMonday);
      monday.setDate(nextMonday.getDate() + (week * 7));
      schedule.push({
        date: new Date(monday),
        day: 'Monday',
        week: week + 1
      });
      
      // Wednesday
      const wednesday = new Date(monday);
      wednesday.setDate(monday.getDate() + 2);
      schedule.push({
        date: new Date(wednesday),
        day: 'Wednesday',
        week: week + 1
      });
      
      // Friday
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      schedule.push({
        date: new Date(friday),
        day: 'Friday',
        week: week + 1
      });
    }
    
    return schedule;
  };

  const classSchedule = generateClassSchedule();

  // Edit Student State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "" });

  // Create Assignment State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assnForm, setAssnForm] = useState({ title: "", description: "", deadline: "", is_final_project: false });
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: "", description: "", material_type: "document" });
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const [analyticsRes, pendingRes, assnRes, attendanceRes, submissionsRes, materialsRes] = await Promise.all([
        api.get(`/classes/${classId}/analytics`),
        api.get(`/class_students/pending/${classId}`),
        api.get(`/assignments/class/${classId}`),
        api.get(`/attendance/class/${classId}`).catch(() => ({ data: [] })),
        api.get(`/submissions/`).catch(() => ({ data: [] })),
        api.get(`/materials/class/${classId}`).catch(() => ({ data: [] }))
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
      await api.post(`/class_students/approve`, {
        class_id: classId,
        student_id: studentId
      });
      toast.success("Enrollment confirmed!");
      fetchClassData();
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("Approval failed.");
    }
  };

  const handleDecline = async (studentId: string) => {
    try {
      await api.delete(`/class_students/class/${classId}/student/${studentId}`);
      toast.success("Request removed.");
      fetchClassData();
    } catch (err) {
      console.error("Decline error:", err);
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
      setShowCreateModal(false);
      fetchClassData();
    } catch (err) {
      toast.error("Failed to post assignment.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, week: number, dayIndex: number, status: string) => {
    const slot = (week - 1) * 3 + dayIndex + 1; // 1-based, Mon=1, Wed=2, Fri=3 per week
    try {
      await api.post("/attendance/", {
        class_id: classId,
        student_id: studentId,
        status: status,
        slot: slot
      });
      fetchClassData(); // Refresh data
    } catch (err) {
      toast.error("Failed to mark attendance");
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

  const deleteMaterial = async (id: string) => {
    if (!confirm("Permanently delete this course material?")) return;
    try {
       await api.delete(`/materials/${id}`);
       toast.success("Material deleted.");
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

  const openGradeModal = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeForm({
      score: submission.score?.toString() || "",
      feedback: submission.feedback || ""
    });
    setShowGradeModal(true);
  };

  const submitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      await api.put(`/submissions/${selectedSubmission.id}/grade`, {
        grade: gradeForm.score,
        feedback: gradeForm.feedback
      });
      toast.success("Submission graded successfully!");
      setShowGradeModal(false);
      setSelectedSubmission(null);
      fetchClassData();
    } catch (err: any) {
      console.error("Grade error:", err);
      const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.response?.data;
      const message = typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((item: any) => item.msg || JSON.stringify(item)).join(" \n")
        : JSON.stringify(detail);
      toast.error(message || "Grading failed.");
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

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("class_id", classId);
      formData.append("title", materialForm.title);
      formData.append("description", materialForm.description);
      formData.append("material_type", materialForm.material_type);
      formData.append("file", selectedFile);

      await api.post("/materials/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Course material uploaded successfully!");
      setMaterialForm({ title: "", description: "", material_type: "document" });
      setSelectedFile(null);
      setShowMaterialModal(false);
      fetchClassData();
    } catch (err) {
      toast.error("Failed to upload material.");
    } finally {
      setIsPosting(false);
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
                  onClick={() => setActiveTab("materials")} 
                  className={`btn ${activeTab === "materials" ? "btn-primary" : "btn-ghost"}`}
                  style={{ justifyContent: "flex-start", gap: "1rem", fontSize: "0.9rem" }}
                >
                   <FileText size={18} /> Course Materials
                </button>
                <button 
                  onClick={() => setActiveTab("assignments")} 
                  className={`btn ${activeTab === "assignments" ? "btn-primary" : "btn-ghost"}`}
                  style={{ justifyContent: "flex-start", gap: "1rem", fontSize: "0.9rem" }}
                >
                   <Edit size={18} /> Assignments
                </button>
             </div>
             
             <div style={{ marginTop: "4rem" }}>
                <div style={{ padding: "1.25rem", background: "white", border: "1px solid var(--color-border)", borderRadius: "1rem" }}>
                   <p className="text-small" style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Cohort Health</p>
                   <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                      {analytics?.students?.length > 0 
                        ? (analytics.students.reduce((acc: any, s: any) => acc + s.grade_average, 0) / analytics.students.length).toFixed(0)
                        : "0"}%
                   </div>
                </div>
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
                    <div style={{ padding: "1.5rem", borderLeft: "4px solid var(--color-error)", marginBottom: "2.5rem", background: "var(--color-bg)", borderRadius: "1rem" }}>
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
                    </div>
                  )}

                  <div className="flex-column gap-3">
                    {analytics?.students?.map((s: any) => (
                      <Card key={s.student_id}>
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
                      <h3 className="text-h2" style={{ fontSize: "1.5rem" }}>Class Attendance</h3>
                      <p className="text-small">Mark attendance for each class session.</p>
                    </div>
                  </div>
                  {analytics?.students?.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
                      <p>No students enrolled yet</p>
                    </div>
                  ) : (
                    <div className="flex-column gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                        <Card key={week}>
                          <h4 style={{ fontWeight: 700, marginBottom: "1rem" }}>Week {week}</h4>
                          <div className="grid-cols-3 gap-3">
                            {['Monday', 'Wednesday', 'Friday'].map((day, dayIndex) => {
                              const slot = (week - 1) * 3 + dayIndex + 1;
                              return (
                                <div key={day} style={{ padding: "1rem", border: "1px solid var(--color-border)", borderRadius: "0.5rem" }}>
                                  <h5 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{day}</h5>
                                  <div className="flex-column gap-2">
                                    {analytics.students.map((student: any) => {
                                      const studentAttendance = attendance.find((a: any) => 
                                        a.student_id === student.student_id && a.slot === slot
                                      );
                                      const isPresent = studentAttendance?.status === 'present';
                                      return (
                                        <div key={student.student_id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                          <input
                                            type="checkbox"
                                            checked={isPresent}
                                            onChange={(e) => handleMarkAttendance(
                                              student.student_id, 
                                              week, 
                                              dayIndex, 
                                              e.target.checked ? 'present' : 'absent'
                                            )}
                                          />
                                          <span style={{ fontSize: "0.8rem" }}>{student.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "grading" && (
                <>
                  <div className="flex-between" style={{ marginBottom: "2rem" }}>
                    <div>
                      <h3 className="text-h2" style={{ fontSize: "1.5rem" }}>Academic Results</h3>
                      <p className="text-small">Review and manage student submissions.</p>
                    </div>
                  </div>
                  {assignments.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
                      <p>No assignments created yet</p>
                    </div>
                  ) : (
                    <div className="flex-column gap-3">
                      {assignments.map((assignment: any) => {
                        const assignmentSubmissions = submissions.filter((s: any) => s.assignment_id === assignment.id);
                        return (
                          <Card key={assignment.id}>
                            <div style={{ marginBottom: "1rem" }}>
                              <h4 style={{ fontWeight: 700 }}>{assignment.title}</h4>
                              <p className="text-small" style={{ opacity: 0.5 }}>
                                {assignmentSubmissions.length} submissions | Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex-column gap-3">
                              {assignmentSubmissions.length > 0 ? (
                                assignmentSubmissions.map((sub: any) => (
                                  <div key={sub.id} style={{ padding: "1.5rem", background: "rgba(0,0,0,0.03)", borderRadius: "1rem", border: "1px solid rgba(0,0,0,0.05)" }}>
                                    <div className="flex-between" style={{ marginBottom: "0.75rem" }}>
                                      <div>
                                        <p className="text-small" style={{ fontWeight: 800, fontSize: "1rem" }}>{sub.student?.first_name ? `${sub.student.first_name} ${sub.student.last_name}` : sub.student_id}</p>
                                        <p className="text-small" style={{ opacity: 0.6, marginTop: "0.25rem" }}>Submission ID: {sub.id}</p>
                                      </div>
                                      <div style={{ textAlign: "right" }}>
                                        <p className="text-small" style={{ fontWeight: 800, opacity: 0.75 }}>Score</p>
                                        <p className="text-small" style={{ fontSize: "1rem", marginTop: "0.25rem" }}>{sub.score ?? "Not graded"}</p>
                                      </div>
                                    </div>
                                    <div className="flex-column gap-2" style={{ marginBottom: "0.75rem" }}>
                                      {sub.submission_link && (
                                        <a href={sub.submission_link} target="_blank" rel="noreferrer" className="text-small" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                                          View Submission Link
                                        </a>
                                      )}
                                      {sub.github_link && (
                                        <a href={sub.github_link} target="_blank" rel="noreferrer" className="text-small" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                                          View GitHub Repo
                                        </a>
                                      )}
                                      {sub.demo_link && (
                                        <a href={sub.demo_link} target="_blank" rel="noreferrer" className="text-small" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                                          View Demo
                                        </a>
                                      )}
                                      {sub.submission_file_url && (
                                        <a href={sub.submission_file_url} target="_blank" rel="noreferrer" className="text-small" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                                          Download Submission File
                                        </a>
                                      )}
                                      {!sub.submission_link && !sub.github_link && !sub.demo_link && !sub.submission_file_url && (
                                        <p className="text-small" style={{ opacity: 0.6 }}>No submission material attached.</p>
                                      )}
                                    </div>
                                    <div className="flex-between" style={{ gap: "1rem", flexWrap: "wrap" }}>
                                      {sub.score == null ? (
                                        <button className="btn btn-primary btn-sm" onClick={() => openGradeModal(sub)}>
                                          Grade Submission
                                        </button>
                                      ) : (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                          <span className="text-small" style={{ fontWeight: 700 }}>Already graded</span>
                                          <span className="text-small" style={{ opacity: 0.6 }}>Score: {sub.score}</span>
                                        </div>
                                      )}
                                      <span className="text-small" style={{ opacity: 0.6 }}>
                                        Submitted: {new Date(sub.submitted_at || sub.created_at || Date.now()).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-small" style={{ opacity: 0.5 }}>No submissions yet</p>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {activeTab === "materials" && (
                <>
                  <div className="flex-between" style={{ marginBottom: "2rem" }}>
                    <div>
                      <h3 className="text-h2" style={{ fontSize: "1.5rem" }}>Course Materials</h3>
                      <p className="text-small">Upload slides, PDFs, videos, and other learning resources for students.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowMaterialModal(true)}>
                      <Plus size={18} /> Upload Material
                    </button>
                  </div>
                  {materials.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
                      <p>No course materials uploaded yet. Upload some learning resources!</p>
                    </div>
                  ) : (
                    <div className="flex-column gap-3">
                      {materials.map((material: any) => (
                        <Card key={material.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                            <div>
                              <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{material.title}</h4>
                              <p className="text-small" style={{ opacity: 0.6, marginTop: "0.25rem" }}>{material.description}</p>
                              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                <span className="badge badge-blue">{material.material_type?.toUpperCase()}</span>
                                <span className="text-small" style={{ opacity: 0.5 }}>
                                  Uploaded: {new Date(material.created_at || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button className="btn btn-ghost btn-sm"><Download size={18} /></button>
                              <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => deleteMaterial(material.id)}><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "assignments" && (
                <>
                  <div className="flex-between" style={{ marginBottom: "2rem" }}>
                    <div>
                      <h3 className="text-h2" style={{ fontSize: "1.5rem" }}>Assignments</h3>
                      <p className="text-small">Create and manage assignments for students.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                      <Plus size={18} /> New Assignment
                    </button>
                  </div>
                  {assignments.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
                      <p>No assignments yet. Create one to get started!</p>
                    </div>
                  ) : (
                    <div className="flex-column gap-3">
                      {assignments.map((assignment: any) => (
                        <Card key={assignment.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                            <div>
                              <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{assignment.title}</h4>
                              <p className="text-small" style={{ opacity: 0.6, marginTop: "0.25rem" }}>{assignment.description}</p>
                              <p className="text-small" style={{ opacity: 0.5, marginTop: "0.5rem" }}>
                                Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                {assignment.is_final_project && <span style={{ marginLeft: "1rem", fontWeight: 700, color: "var(--color-warning)" }}>FINAL PROJECT</span>}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button className="btn btn-ghost btn-sm"><Download size={18} /></button>
                              <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => deleteAssignment(assignment.id)}><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </section>
      </main>

      {/* Edit Student Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
           <div style={{ maxWidth: "450px", width: "100%" }}>
             <Card className="animate-fade-in">
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
        </div>
      )}

      {showGradeModal && selectedSubmission && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <Card className="animate-fade-in">
              <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                  <h3 className="text-h3">Grade Submission</h3>
                  <p className="text-small" style={{ opacity: 0.6 }}>
                    {selectedSubmission.student?.first_name ? `${selectedSubmission.student.first_name} ${selectedSubmission.student.last_name}` : selectedSubmission.student_id}
                  </p>
                </div>
                <button onClick={() => setShowGradeModal(false)} className="btn btn-ghost" style={{ padding: "0.5rem" }}><X size={20} /></button>
              </div>
              <form onSubmit={submitGrade} className="flex-column gap-3">
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>SCORE</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={gradeForm.score}
                    onChange={e => setGradeForm({...gradeForm, score: e.target.value})}
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>FEEDBACK</label>
                  <textarea
                    rows={4}
                    value={gradeForm.feedback}
                    onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})}
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Submit Grade</button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <Card className="animate-fade-in">
              <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h3 className="text-h3">Create Assignment</h3>
                <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost" style={{ padding: "0.5rem" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateAssignment} className="flex-column gap-3">
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>TITLE</label>
                  <input
                    required
                    value={assnForm.title}
                    onChange={e => setAssnForm({...assnForm, title: e.target.value})}
                    placeholder="e.g., Build a REST API"
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>DESCRIPTION</label>
                  <textarea
                    required
                    rows={4}
                    value={assnForm.description}
                    onChange={e => setAssnForm({...assnForm, description: e.target.value})}
                    placeholder="Describe the assignment requirements..."
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>DEADLINE</label>
                  <input
                    required
                    type="date"
                    value={assnForm.deadline}
                    onChange={e => setAssnForm({...assnForm, deadline: e.target.value})}
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>FILE (OPTIONAL)</label>
                  <input
                    type="file"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="is_final"
                    checked={assnForm.is_final_project}
                    onChange={e => setAssnForm({...assnForm, is_final_project: e.target.checked})}
                  />
                  <label htmlFor="is_final" className="text-small" style={{ fontWeight: 700 }}>This is a Final Project</label>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={isPosting} className="btn btn-primary" style={{ flex: 1 }}>
                    {isPosting ? "Creating..." : "Create Assignment"}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <Card className="animate-fade-in">
              <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h3 className="text-h3">Upload Course Material</h3>
                <button onClick={() => setShowMaterialModal(false)} className="btn btn-ghost" style={{ padding: "0.5rem" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateMaterial} className="flex-column gap-3">
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>TITLE</label>
                  <input
                    required
                    value={materialForm.title}
                    onChange={e => setMaterialForm({...materialForm, title: e.target.value})}
                    placeholder="e.g., Week 1 Slides"
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={materialForm.description}
                    onChange={e => setMaterialForm({...materialForm, description: e.target.value})}
                    placeholder="Brief description of the material"
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>MATERIAL TYPE</label>
                  <select
                    value={materialForm.material_type}
                    onChange={e => setMaterialForm({...materialForm, material_type: e.target.value})}
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  >
                    <option value="document">Document (PDF, DOC)</option>
                    <option value="slides">Slides (PPT, Keynote)</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex-column gap-1">
                  <label className="text-small" style={{ fontWeight: 700 }}>FILE</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mp3,.wav"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)" }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isPosting}>
                  {isPosting ? "Uploading..." : "Upload Material"}
                </button>
              </form>
            </Card>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
