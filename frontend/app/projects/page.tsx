"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Search, Heart, MessageCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("all");

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLike = async (id: string, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await api.delete(`/projects/${id}/like`);
      } else {
        await api.post(`/projects/${id}/like`);
      }
      fetchProjects();
    } catch (err: any) {
      console.error("Like interaction failed", err);
    }
  };

  const filteredProjects = projects.filter(p => 
    activeTrack === "all" || p.student?.track?.toLowerCase() === activeTrack.toLowerCase()
  );

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
            
            {user && (
              <div style={{ marginTop: "1rem" }}>
                <Link href={user.is_admin ? "/dashboard/admin" : user.role === 'instructor' ? "/dashboard/instructor" : "/dashboard/student"}>
                  <button className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ArrowLeft size={16} />
                    Back to My Dashboard
                  </button>
                </Link>
              </div>
            )}
            
            {/* Filters & Search */}
            <div className="flex-between" style={{ marginTop: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  className={`btn ${activeTrack === "all" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTrack("all")}
                >
                  All Projects
                </button>
                <button 
                  className={`btn ${activeTrack === "frontend" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTrack("frontend")}
                >
                  Frontend
                </button>
                <button 
                  className={`btn ${activeTrack === "backend" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTrack("backend")}
                >
                  Backend
                </button>
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
          <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2.5rem" }}>
            {loading ? (
              <p>Loading projects...</p>
            ) : filteredProjects.length > 0 ? filteredProjects.map((proj) => {
              const previewUrl = proj.demo_link 
                ? `https://api.microlink.io?url=${encodeURIComponent(proj.demo_link)}&screenshot=true&meta=false&embed=screenshot.url`
                : `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80`;

              return (
                <Card className="hover-lift" key={proj.id} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", border: "1px solid var(--color-border)", borderRadius: "1.25rem", background: "white" }}>
                  <Link href={`/projects/${proj.id}`} style={{ textDecoration: "none", display: "block", position: "relative" }}>
                    <div style={{ 
                      height: "200px", 
                      width: "100%", 
                      backgroundImage: `url(${previewUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "top center",
                      borderBottom: "1px solid var(--color-border)"
                    }}>
                      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "white", background: "rgba(0,0,0,0.6)", padding: "0.3rem 0.8rem", borderRadius: "1rem", textTransform: "uppercase", backdropFilter: "blur(4px)" }}>
                           {proj.student?.track || "Project"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", flexGrow: 1 }}>
                    <div className="flex-between" style={{ alignItems: "flex-start" }}>
                      <div>
                        <h3 className="text-h3" style={{ color: "var(--color-text-main)", marginBottom: "0.25rem", fontSize: "1.25rem" }}>{proj.title || 'Untitled'}</h3>
                        <p className="text-small" style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--color-primary)" }}>{proj.student?.first_name} {proj.student?.last_name}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleLike(proj.id, proj.has_liked); }}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem", borderRadius: "0.5rem", transition: "all 0.2s" }}
                        className={proj.has_liked ? "liked-pulse" : ""}
                      >
                        <Heart size={20} fill={proj.has_liked ? "#ef4444" : "none"} color={proj.has_liked ? "#ef4444" : "var(--color-text-subtle)"} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: proj.has_liked ? "#ef4444" : "var(--color-text-subtle)" }}>{proj.likes_count}</span>
                      </button>
                    </div>
                    
                    <p className="text-small" style={{ opacity: 0.7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                      {proj.description || "A dedicated project built at Devoria."}
                    </p>

                    <div style={{ marginTop: "auto", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9" }}>
                      <Link href={`/projects/${proj.id}`} className="text-small" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                        VIEW DETAILED PROJECT &rarr;
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            }) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "6rem 0", opacity: 0.7 }}>
                 <p className="text-h3" style={{ marginBottom: "1rem" }}>No projects submitted for {activeTrack === "all" ? "the showcase" : activeTrack} yet.</p>
                 <p className="text-body">Check back later to see the amazing work from our {activeTrack !== "all" ? activeTrack : ""} students!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
