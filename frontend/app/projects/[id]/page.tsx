"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. HERO STRIP: Replaced the harsh gradient background with the same
 *    radial mesh system as the rest of the product. Back-link is a
 *    clean text link with uppercase tracking. Dashboard link is a
 *    secondary text link, not a competing colored anchor.
 *
 * 2. TYPOGRAPHY: DM Sans + Instrument Serif. Project title uses the
 *    serif display treatment with proper size and tight tracking.
 *    Author name and role are clearly hierarchical.
 *
 * 3. AUTHOR ROW: Avatar is a gradient-blue square with initials.
 *    Track badge uses the same color-coded pill system as the Projects
 *    list page (blue/purple/green per track).
 *
 * 4. LAYOUT: Two-column grid (image left, details right) with a proper
 *    max-width container. Collapses to single column on mobile.
 *
 * 5. IMAGE CARD: Removed the glass-panel wrapper. Clean white card with
 *    16px radius and shadow. Image fills the 16:10 aspect ratio box.
 *    Fallback handled in onError (logic unchanged).
 *
 * 6. ACTION BUTTONS: Demo and Source buttons are properly styled.
 *    Like button is a pill with border that turns red on liked state —
 *    matches the Projects list card system.
 *
 * 7. OVERVIEW SECTION: "Project Overview" has a proper label +
 *    description hierarchy. Section label uses uppercase tracking.
 *
 * 8. DIVIDER: Removed the 1px vertical divider between action buttons
 *    and the like button — replaced with natural gap spacing.
 *
 * 9. LOADING / NOT FOUND: Full-screen spinner and a proper error card
 *    instead of bare centered text.
 *
 * 10. RESPONSIVENESS: Header wraps on mobile. Two-column grid collapses
 *     to single column below 768px.
 * ─────────────────────────────────────────────────────────────────
 */

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

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --pd-blue-50:   #eff6ff;
      --pd-blue-100:  #dbeafe;
      --pd-blue-200:  #bfdbfe;
      --pd-blue-500:  #3b82f6;
      --pd-blue-600:  #2563eb;
      --pd-blue-700:  #1d4ed8;
      --pd-purple-100:#f3e8ff;
      --pd-purple-600:#9333ea;
      --pd-green-100: #dcfce7;
      --pd-green-600: #16a34a;
      --pd-red-500:   #ef4444;
      --pd-gray-50:   #f9fafb;
      --pd-gray-100:  #f3f4f6;
      --pd-gray-200:  #e5e7eb;
      --pd-gray-300:  #d1d5db;
      --pd-gray-400:  #9ca3af;
      --pd-gray-500:  #6b7280;
      --pd-gray-700:  #374151;
      --pd-gray-900:  #111827;
      --pd-font:  'DM Sans', sans-serif;
      --pd-serif: 'Instrument Serif', serif;
      --pd-r-lg: 16px; --pd-r-xl: 20px;
      --pd-shadow-xs: 0 1px 2px rgba(0,0,0,.05);
      --pd-shadow-sm: 0 2px 8px rgba(0,0,0,.06);
      --pd-shadow-md: 0 8px 28px rgba(0,0,0,.09);
      --pd-shadow-lg: 0 20px 60px rgba(0,0,0,.10);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--pd-font); color: var(--pd-gray-900); background: #f8fafc; -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .pd-page { display: flex; flex-direction: column; min-height: 100vh; }
    .pd-main { flex: 1; }

    /* ── Hero strip ── */
    .pd-hero {
      padding: 3.5rem 1.5rem 2.75rem;
      background:
        radial-gradient(ellipse 80% 60% at 70% -20%, rgba(59,130,246,.09) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 5%  110%, rgba(29,78,216,.05) 0%, transparent 55%),
        #ffffff;
      border-bottom: 1px solid var(--pd-gray-200);
    }
    .pd-hero-inner { max-width: 1100px; margin: 0 auto; }

    /* Nav links */
    .pd-nav-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .pd-back-link {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: .75rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
      color: var(--pd-blue-600); text-decoration: none; opacity: .8; transition: opacity .2s;
    }
    .pd-back-link:hover { opacity: 1; }
    .pd-dash-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: .75rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
      color: var(--pd-gray-400); text-decoration: none; transition: color .15s;
    }
    .pd-dash-link:hover { color: var(--pd-gray-700); }

    /* Hero title */
    .pd-hero-title {
      font-family: var(--pd-serif);
      font-size: clamp(1.9rem, 5vw, 3rem);
      font-weight: 400; letter-spacing: -.025em; line-height: 1.12;
      color: var(--pd-gray-900); margin-bottom: 1.25rem;
    }

    /* Author + meta row */
    .pd-meta-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .pd-author {
      display: flex; align-items: center; gap: .75rem;
    }
    .pd-avatar {
      width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--pd-blue-500), var(--pd-blue-800));
      color: white; font-size: .875rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .pd-author-name { font-size: .9rem; font-weight: 800; color: var(--pd-gray-900); }
    .pd-author-role {
      font-size: .63rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: var(--pd-gray-400); margin-top: 1px;
    }
    .pd-divider-v { width: 1px; height: 22px; background: var(--pd-gray-200); flex-shrink: 0; }
    .pd-track-badge {
      font-size: .63rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 999px;
    }
    .pd-track-badge.frontend  { background: var(--pd-blue-50);   color: var(--pd-blue-700);   border: 1px solid var(--pd-blue-100); }
    .pd-track-badge.backend   { background: var(--pd-purple-100);color: var(--pd-purple-600); border: 1px solid #e9d5ff; }
    .pd-track-badge.fullstack { background: var(--pd-green-100); color: var(--pd-green-600); border: 1px solid #bbf7d0; }
    .pd-track-badge.default   { background: var(--pd-gray-100);  color: var(--pd-gray-600, #4b5563); border: 1px solid var(--pd-gray-200); }

    /* ── Content area ── */
    .pd-content {
      max-width: 1100px; margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
      display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem;
      align-items: start;
    }

    /* ── Image card ── */
    .pd-img-card {
      background: white; border: 1px solid var(--pd-gray-200);
      border-radius: var(--pd-r-xl); overflow: hidden;
      box-shadow: var(--pd-shadow-md);
    }
    .pd-img-ratio {
      position: relative; width: 100%; padding-bottom: 62.5%; /* 16:10 */
      background: var(--pd-gray-50);
    }
    .pd-img-ratio img {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover; object-position: top;
    }

    /* ── Details panel ── */
    .pd-details { display: flex; flex-direction: column; gap: 2rem; }

    .pd-overview-label {
      font-size: .65rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: var(--pd-blue-600); margin-bottom: .75rem;
    }
    .pd-overview-text {
      font-size: .95rem; color: var(--pd-gray-500); line-height: 1.75;
    }

    /* Action row */
    .pd-actions { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }

    .pd-btn {
      display: inline-flex; align-items: center; gap: .4rem;
      padding: 10px 20px; border-radius: var(--pd-r-lg);
      font-family: var(--pd-font); font-size: .875rem; font-weight: 700;
      text-decoration: none; border: none; cursor: pointer;
      transition: background .15s, box-shadow .15s, transform .15s;
    }
    .pd-btn:hover { transform: translateY(-1px); }
    .pd-btn-primary { background: var(--pd-blue-600); color: white; box-shadow: 0 1px 3px rgba(37,99,235,.28); }
    .pd-btn-primary:hover { background: var(--pd-blue-700); box-shadow: 0 4px 12px rgba(37,99,235,.32); }
    .pd-btn-ghost { background: white; color: var(--pd-gray-700); border: 1.5px solid var(--pd-gray-200); }
    .pd-btn-ghost:hover { border-color: var(--pd-gray-300); background: var(--pd-gray-50); }

    /* Like button */
    .pd-like-btn {
      display: inline-flex; align-items: center; gap: .45rem;
      padding: 9px 16px; border-radius: 999px;
      border: 1.5px solid var(--pd-gray-200); background: white; cursor: pointer;
      font-family: var(--pd-font); font-size: .875rem; font-weight: 700;
      color: var(--pd-gray-500);
      transition: border-color .15s, background .15s, color .15s;
    }
    .pd-like-btn:hover { border-color: #fca5a5; background: #fef2f2; color: var(--pd-red-500); }
    .pd-like-btn.liked { border-color: #fca5a5; background: #fef2f2; color: var(--pd-red-500); }

    /* Info strip */
    .pd-info-strip {
      display: flex; flex-direction: column; gap: .5rem;
      padding: 1.25rem 1.5rem;
      background: var(--pd-gray-50); border: 1px solid var(--pd-gray-200);
      border-radius: var(--pd-r-lg);
    }
    .pd-info-row { display: flex; justify-content: space-between; align-items: center; }
    .pd-info-key { font-size: .72rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: var(--pd-gray-400); }
    .pd-info-val { font-size: .85rem; font-weight: 600; color: var(--pd-gray-700); }

    /* ── Loading / error ── */
    .pd-status {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; flex-direction: column; gap: 1rem; background: white;
    }
    .pd-spinner {
      width: 34px; height: 34px;
      border: 3px solid var(--pd-blue-100); border-top-color: var(--pd-blue-600);
      border-radius: 50%; animation: pd-spin .7s linear infinite;
    }
    @keyframes pd-spin { to { transform: rotate(360deg); } }
    .pd-status-text { font-size: .875rem; font-weight: 600; color: var(--pd-gray-400); }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .pd-content { grid-template-columns: 1fr; gap: 2rem; padding: 2rem 1rem 4rem; }
      .pd-hero { padding: 2.5rem 1rem 2rem; }
    }
    @media (max-width: 480px) {
      .pd-hero-title { font-size: 1.75rem; }
      .pd-actions { flex-direction: column; align-items: stretch; }
      .pd-btn, .pd-like-btn { justify-content: center; }
    }
  `}</style>
);

export default function ProjectDetails() {
  const { user } = useAuth();
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* Logic unchanged */
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

  /* Track badge class helper */
  const trackClass = (track: string) => {
    const t = (track || "").toLowerCase();
    if (t === "frontend")  return "pd-track-badge frontend";
    if (t === "backend")   return "pd-track-badge backend";
    if (t === "fullstack") return "pd-track-badge fullstack";
    return "pd-track-badge default";
  };

  const dashHref = user?.is_admin ? "/dashboard/admin" : user?.role === "instructor" ? "/dashboard/instructor" : "/dashboard/student";

  const previewUrl = project?.demo_link
    ? `https://api.microlink.io?url=${encodeURIComponent(project.demo_link)}&screenshot=true&meta=false&embed=screenshot.url`
    : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";

  if (loading) return (
    <>
      <GlobalStyles />
      <div className="pd-status">
        <div className="pd-spinner" />
        <p className="pd-status-text">Loading project…</p>
      </div>
    </>
  );

  if (!project) return (
    <>
      <GlobalStyles />
      <div className="pd-status">
        <p className="pd-status-text">Project not found.</p>
        <Link href="/projects" style={{ fontSize: ".875rem", fontWeight: 700, color: "var(--pd-blue-600)", textDecoration: "none" }}>
          ← Back to Showcase
        </Link>
      </div>
    </>
  );

  return (
    <>
      <GlobalStyles />
      <div className="pd-page">
        <Navbar />
        <main className="pd-main">

          {/* ── Hero ── */}
          <section className="pd-hero">
            <div className="pd-hero-inner">

              {/* Nav row */}
              <div className="pd-nav-row">
                <Link href="/projects" className="pd-back-link">
                  <ArrowLeft size={12} /> Back to Showcase
                </Link>
                {user && (
                  <Link href={dashHref} className="pd-dash-link">
                    Dashboard →
                  </Link>
                )}
              </div>

              {/* Title */}
              <h1 className="pd-hero-title">{project.title || "Untitled Project"}</h1>

              {/* Author + track */}
              <div className="pd-meta-row">
                <div className="pd-author">
                  <div className="pd-avatar">
                    {project.student?.first_name?.[0]}{project.student?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="pd-author-name">{project.student?.first_name} {project.student?.last_name}</p>
                    <p className="pd-author-role">Developer</p>
                  </div>
                </div>

                <div className="pd-divider-v" />

                <span className={trackClass(project.student?.track)}>
                  {project.student?.track || "Project"}
                </span>
              </div>
            </div>
          </section>

          {/* ── Two-column content ── */}
          <div className="pd-content">

            {/* Left: preview image */}
            <div className="pd-img-card">
              <div className="pd-img-ratio">
                <img
                  src={previewUrl}
                  alt="Project Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              </div>
            </div>

            {/* Right: details */}
            <div className="pd-details">

              {/* Overview */}
              <div>
                <p className="pd-overview-label">Project Overview</p>
                <p className="pd-overview-text">
                  {project.description || "A dedicated professional project developed by a Devoria student showcasing advanced technical skills and real-world application."}
                </p>
              </div>

              {/* Info strip */}
              <div className="pd-info-strip">
                <div className="pd-info-row">
                  <span className="pd-info-key">Student</span>
                  <span className="pd-info-val">{project.student?.first_name} {project.student?.last_name}</span>
                </div>
                <div className="pd-info-row">
                  <span className="pd-info-key">Track</span>
                  <span className="pd-info-val" style={{ textTransform: "capitalize" }}>{project.student?.track || "—"}</span>
                </div>
                <div className="pd-info-row">
                  <span className="pd-info-key">Likes</span>
                  <span className="pd-info-val">{project.likes_count ?? 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pd-actions">
                {project.demo_link && (
                  <a href={project.demo_link} target="_blank" rel="noreferrer" className="pd-btn pd-btn-primary">
                    <ExternalLink size={15} /> Live Demo
                  </a>
                )}
                {project.github_link && (
                  <a href={project.github_link} target="_blank" rel="noreferrer" className="pd-btn pd-btn-ghost">
                    <Code2 size={15} /> View Source
                  </a>
                )}
                <button
                  onClick={handleLike}
                  className={`pd-like-btn${project.has_liked ? " liked" : ""}`}
                >
                  <Heart
                    size={15}
                    fill={project.has_liked ? "var(--pd-red-500)" : "none"}
                    color={project.has_liked ? "var(--pd-red-500)" : "currentColor"}
                  />
                  {project.likes_count}
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}