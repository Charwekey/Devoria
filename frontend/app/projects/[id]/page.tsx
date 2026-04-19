"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Code2, ExternalLink, ArrowLeft, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function ProjectDetails() {
  const { user } = useAuth();
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${params.id}`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to load project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchProject();
  }, [params.id]);

  const handleLike = async () => {
    if (!project) return;
    try {
      if (project.has_liked) {
        await api.delete(`/projects/${project.id}/like`);
      } else {
        await api.post(`/projects/${project.id}/like`);
      }
      fetchProject();
    } catch (err: any) {
      console.error("Like interaction failed", err);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: "100vh" }}><p>Loading project...</p></div>;
  if (!project) return <div className="flex-center" style={{ minHeight: "100vh" }}><p>Project not found.</p></div>;

  return (
    <>
      <Navbar />
      <main className="app-container">
        {/* Large Header */}
        <section style={{ padding: "4rem 0", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(167, 139, 250, 0.1))" }}>
          <div className="container flex-column gap-3">
             <div style={{ display: "flex", gap: "1.5rem" }}>
               <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
                 <ArrowLeft size={18} /> Back to Showcase
               </Link>
               {user && (
                 <Link href={user.is_admin ? "/dashboard/admin" : user.role === 'instructor' ? "/dashboard/instructor" : "/dashboard/student"} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-accent-purple)", textDecoration: "none", fontWeight: 600 }}>
                   Dashboard Overview &rarr;
                 </Link>
               )}
             </div>
             <h1 className="text-h1" style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "0.5rem" }}>{project.title || "Untitled Project"}</h1>
             <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                   <div style={{ 
                     width: "40px", 
                     height: "40px", 
                     borderRadius: "10px", 
                     background: "var(--color-primary)", 
                     color: "white", 
                     display: "flex", 
                     alignItems: "center", 
                     justifyContent: "center",
                     fontWeight: 800,
                     fontSize: "0.9rem"
                   }}>
                      {project.student?.first_name?.[0]}{project.student?.last_name?.[0]}
                   </div>
                   <div className="flex-column">
                      <span className="text-small" style={{ fontWeight: 800, fontSize: "0.85rem" }}>{project.student?.first_name} {project.student?.last_name}</span>
                      <span className="text-small" style={{ fontSize: "0.65rem", opacity: 0.6, textTransform: "uppercase", fontWeight: 700 }}>Developer</span>
                   </div>
                </div>
                <div style={{ width: "1px", height: "24px", background: "var(--color-border)" }} />
                <span style={{ 
                  padding: "0.25rem 0.75rem", 
                  background: "var(--color-primary-light)", 
                  color: "var(--color-primary)", 
                  borderRadius: "2rem", 
                  fontSize: "0.7rem", 
                  fontWeight: 800,
                  textTransform: "uppercase"
                }}>
                  {project.student?.track || "Project"}
                </span>
             </div>
          </div>
        </section>

        <section style={{ padding: "4rem 0", flexGrow: 1 }}>
          <div className="container grid-cols-2" style={{ gap: "4rem", alignItems: "start" }}>
            
            {/* Project Image/Demo Preview */}
            <Card className="glass-panel" style={{ padding: "0.5rem", width: "100%", background: "white", overflow: "hidden" }}>
               <div style={{ 
                 width: "100%", 
                 position: "relative",
                 paddingBottom: "62.5%", // 16:10 Aspect Ratio
                 borderRadius: "0.5rem",
                 overflow: "hidden",
                 background: "#f8fafc"
               }}>
                  <img 
                    src={project.demo_link ? `https://api.microlink.io?url=${encodeURIComponent(project.demo_link)}&screenshot=true&meta=false&embed=screenshot.url` : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'} 
                    alt="Project Preview"
                    style={{ 
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top"
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
               </div>
            </Card>

            {/* Project Details */}
            <div className="flex-column gap-4">
              <div>
                <h3 className="text-h3" style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Project Overview</h3>
                <p className="text-body" style={{ lineHeight: 1.6, opacity: 0.8 }}>
                  {project.description || "A dedicated professional project developed by a Devoria student showcasing advanced technical skills and real-world application."}
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                {project.demo_link && <a href={project.demo_link} target="_blank" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}><ExternalLink size={18} /> Live Demo</a>}
                {project.github_link && <a href={project.github_link} target="_blank" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem" }}><Code2 size={18} /> View Source</a>}
                
                <div style={{ width: "1px", height: "30px", background: "var(--color-border)", margin: "0 0.5rem" }} />
                
                <button 
                  onClick={handleLike}
                  style={{ background: "white", border: "1px solid var(--color-border)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1.25rem", borderRadius: "0.75rem", transition: "all 0.2s" }}
                  className={project.has_liked ? "liked-pulse" : ""}
                >
                  <Heart size={22} fill={project.has_liked ? "#ef4444" : "none"} color={project.has_liked ? "#ef4444" : "var(--color-text-subtle)"} />
                  <span style={{ fontSize: "1rem", fontWeight: 700, color: project.has_liked ? "#ef4444" : "var(--color-text-subtle)" }}>{project.likes_count}</span>
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
