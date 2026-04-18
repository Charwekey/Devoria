"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  ChevronLeft, 
  Clock, 
  FileText, 
  Award,
  Trophy
} from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

export default function ClassEnvironment() {
  const { user, loading } = useAuth();
  const { id: classId } = useParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("assignments");
  const [classData, setClassData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchData = async () => {
    try {
      const safeGet = async (url: string) => {
        try { return (await api.get(url)).data; } catch { return []; }
      };

      const [clsRes, assnData, attData, subData] = await Promise.all([
        api.get(`/classes/${classId}`),
        safeGet(`/assignments/class/${classId}`),
        safeGet(`/attendance/class/${classId}/student/${user?.id}`),
        safeGet(`/submissions/me`)
      ]);
      
      setClassData(clsRes.data);
      setAssignments(assnData || []);
      setAttendance(attData || []);
      setSubmissions(subData || []);
    } catch (err) {
      console.error("Failed to load class environment", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    fetchData();
  }, [user, loading, classId]);

  if (pageLoading || !classData) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <div className="text-body">Entering Environment...</div>
      </div>
    );
  }

  const tabs = [
    { id: "assignments", label: "Assignments", icon: CheckSquare },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "showcase", label: "Showcase", icon: Award },
  ];

  return (
    <div className="flex-column" style={{ minHeight: "100vh" }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, display: "flex", background: "#f8fafc" }}>
        {/* Sidebar */}
        <aside style={{ 
          width: "280px", 
          background: "white", 
          borderRight: "1px solid var(--color-border)",
          padding: "2rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}>
          <div>
             <Link href="/dashboard/student" style={{ 
               display: "inline-flex", 
               alignItems: "center", 
               gap: "0.5rem", 
               color: "var(--color-text-subtle)", 
               textDecoration: "none",
               fontSize: "0.85rem",
               marginBottom: "1.5rem"
             }}>
               <ChevronLeft size={16} /> Back to Dashboard
             </Link>
             <h2 className="text-h2" style={{ fontSize: "1.25rem", color: "var(--color-text)" }}>{classData.class_name}</h2>
             <p className="text-small" style={{ opacity: 0.7 }}>{classData.track} Track</p>
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
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
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
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <section style={{ flexGrow: 1, padding: "2.5rem", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          
          <div className="animate-fade-in">
            {/* Class Stats Summary (Always visible at top of environment) */}
            <div className="grid-cols-2 gap-2" style={{ marginBottom: "2rem" }}>
               <Card style={{ padding: "1.25rem" }}>
                  <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                     <span className="text-small" style={{ fontWeight: 800, fontSize: "0.65rem", opacity: 0.5 }}>MY ATTENDANCE</span>
                     <Calendar size={14} opacity={0.5} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                     {attendance.length > 0 ? (attendance.filter(a => a.status === "present").length / (attendance.length || 1) * 100).toFixed(0) : "0"}%
                  </div>
                  <ProgressBar percentage={attendance.length > 0 ? (attendance.filter(a => a.status === "present").length / (attendance.length || 1)) * 100 : 0} />
               </Card>
               <Card style={{ padding: "1.25rem" }}>
                  <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                     <span className="text-small" style={{ fontWeight: 800, fontSize: "0.65rem", opacity: 0.5 }}>PERFORMANCE AVG</span>
                     <Trophy size={14} opacity={0.5} />
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                     {submissions.length > 0 ? (submissions.reduce((acc, s) => acc + (parseFloat(s.score) || 0), 0) / (assignments.length || 1)).toFixed(1) : "0.0"}%
                  </div>
                  <ProgressBar percentage={submissions.length > 0 ? (submissions.reduce((acc, s) => acc + (parseFloat(s.score) || 0), 0) / (assignments.length || 1)) : 0} />
               </Card>
            </div>

            {activeTab === "assignments" && (
              <>
                <h3 className="text-h2" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Course Assignments</h3>
                <div className="grid-cols-2 gap-2">
                  {assignments.length > 0 ? assignments.map(assn => (
                    <Card key={assn.id} style={{ padding: "1.5rem" }}>
                      <div className="flex-between" style={{ marginBottom: "1rem" }}>
                        <div style={{ background: "var(--color-primary-light)", padding: "0.5rem", borderRadius: "0.5rem" }}>
                          <FileText size={20} color="var(--color-primary)" />
                        </div>
                        <span className="text-small" style={{ fontWeight: 700, color: "var(--color-primary)" }}>{assn.deadline}</span>
                      </div>
                      <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{assn.title}</h4>
                      <p className="text-small" style={{ marginBottom: "1.5rem", minHeight: "3rem" }}>{assn.description}</p>
                      <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>View Details</button>
                    </Card>
                  )) : (
                    <div style={{ gridColumn: "span 2", textAlign: "center", padding: "4rem" }}>
                      <Clock size={48} style={{ opacity: 0.1, margin: "0 auto 1rem" }} />
                      <p>No assignments posted yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "attendance" && (
              <>
                <h3 className="text-h2" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Attendance Record</h3>
                <Card style={{ padding: "0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left", background: "rgba(0,0,0,0.02)" }}>
                        <th style={{ padding: "1rem" }} className="text-small">Date</th>
                        <th style={{ padding: "1rem" }} className="text-small">Status</th>
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
                          <td colSpan={2} style={{ padding: "3rem", textAlign: "center" }}>No attendance history in this environment.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card>
              </>
            )}

            {activeTab === "showcase" && (
              <>
                <h3 className="text-h2" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Submissions & Showcase</h3>
                <div className="grid-cols-2 gap-2">
                  {/* For now, listing student's own submissions. We can expand this to a full-class showcase later. */}
                  {submissions.filter(s => s.assignment?.class_id === classId).length > 0 ? 
                    submissions.filter(s => s.assignment?.class_id === classId).map(sub => (
                    <Card key={sub.id} style={{ padding: "1.5rem" }}>
                      <h4 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{sub.assignment?.title}</h4>
                      <p className="text-small" style={{ marginBottom: "1rem" }}>Submitted {new Date(sub.submitted_at).toLocaleDateString()}</p>
                      
                      <div className="flex-between glass-panel" style={{ padding: "0.75rem", borderRadius: "0.5rem" }}>
                        <span className="text-small" style={{ fontWeight: 600 }}>Score</span>
                        <span style={{ fontWeight: 800, color: "var(--color-primary)" }}>{sub.score !== null ? `${sub.score}/100` : "Pending Grade"}</span>
                      </div>
                    </Card>
                  )) : (
                    <div style={{ gridColumn: "span 2", textAlign: "center", padding: "4rem" }}>
                      <Award size={48} style={{ opacity: 0.1, margin: "0 auto 1rem" }} />
                      <p>You haven't submitted anything in this class yet.</p>
                    </div>
                  )}
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
