"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects/");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <>
      <Navbar />
      <main className="app-container">
        <section style={{ padding: "4rem 0 2rem 0" }}>
          <div className="container flex-column gap-3">
            <h1 className="text-h1">Project <span className="text-gradient">Showcase</span></h1>
            <p className="text-body" style={{ maxWidth: "600px", fontSize: "1.1rem" }}>
              Explore the amazing real-world applications built by our students. Filter by track or search directly.
            </p>
            
            {/* Filters & Search */}
            <div className="flex-between" style={{ marginTop: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn btn-primary">All Projects</button>
                <button className="btn btn-secondary">Frontend</button>
                <button className="btn btn-secondary">Backend</button>
              </div>
              <div className="glass-panel text-small" style={{ display: "flex", padding: "0.5rem 1rem", borderRadius: "9999px", alignItems: "center", gap: "0.5rem" }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  style={{ border: "none", background: "transparent", outline: "none", color: "var(--color-text-main)", width: "200px" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Masonry / Grid */}
        <section style={{ padding: "2rem 0 6rem 0", flexGrow: 1 }}>
          <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {loading ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? projects.map((proj) => {
              const color = proj.title?.length % 2 === 0 ? "blue" : "purple";
              return (
              <Link href={`/projects/${proj.id}`} key={proj.id} style={{ textDecoration: "none" }}>
                <Card hoverEffect style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ 
                    height: "180px", 
                    width: "100%", 
                    background: `linear-gradient(135deg, ${color === "blue" ? "var(--color-primary-light), var(--color-primary)" : "var(--color-accent-purple), var(--color-primary-dark)"})`,
                    opacity: 0.8
                  }} />
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flexGrow: 1 }}>
                    <div>
                      <h3 className="text-h3" style={{ color: "var(--color-text-main)", marginBottom: "0.25rem" }}>{proj.title || 'Untitled'}</h3>
                      <p className="text-small">Live link enclosed</p>
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className={`badge badge-${color}`}>Showcase</span>
                      <span className="text-small" style={{ color: "var(--color-primary)", fontWeight: 600 }}>View Project &rarr;</span>
                    </div>
                  </div>
                </Card>
              </Link>
            )}) : (
              <p>No projects submitted yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
