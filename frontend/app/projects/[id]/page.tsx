"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Github, ExternalLink, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";

export default function ProjectDetails() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
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
    fetchProject();
  }, [params.id]);

  if (loading) return <div className="flex-center" style={{ minHeight: "100vh" }}><p>Loading project...</p></div>;
  if (!project) return <div className="flex-center" style={{ minHeight: "100vh" }}><p>Project not found.</p></div>;

  return (
    <>
      <Navbar />
      <main className="app-container">
        {/* Large Header */}
        <section style={{ padding: "4rem 0", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(167, 139, 250, 0.1))" }}>
          <div className="container flex-column gap-3">
             <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
               <ArrowLeft size={18} /> Back to Showcase
             </Link>
             <h1 className="text-h1">{project.title || "Untitled Project"}</h1>
             <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
               <span className="text-body text-small">Built by <strong style={{ color: "var(--color-text-main)" }}>Student {project.students_id?.substring(0,8) || "Unknown"}</strong></span>
             </div>
          </div>
        </section>

        <section style={{ padding: "4rem 0", flexGrow: 1 }}>
          <div className="container grid-cols-2" style={{ gap: "4rem", alignItems: "start" }}>
            
            {/* Project Image/Demo Placeholder */}
            <Card className="glass-panel" style={{ padding: "1rem", width: "100%", aspectRatio: "16/9", background: "rgba(255, 255, 255, 0.5)" }}>
               <div style={{ width: "100%", height: "100%", borderRadius: "1rem", background: "linear-gradient(135deg, var(--color-primary-light), var(--color-accent-purple))", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                 <p className="text-h3">Live Preview Space</p>
               </div>
            </Card>

            {/* Project Details */}
            <div className="flex-column gap-4">
              <div>
                <h3 className="text-h3" style={{ marginBottom: "1rem" }}>Description</h3>
                <p className="text-body">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                {project.demo_link && <a href={project.demo_link} target="_blank" className="btn btn-primary"><ExternalLink size={18} /> Live Demo</a>}
                {project.github_link && <a href={project.github_link} target="_blank" className="btn btn-secondary"><Github size={18} /> View Source</a>}
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
