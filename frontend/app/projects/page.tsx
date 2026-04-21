"use client";

/**
 * UI/UX IMPROVEMENTS SUMMARY
 * ─────────────────────────────────────────────────────────────────
 * 1. PAGE HEADER: Hero strip with radial gradient mesh (matches Home).
 *    Serif italic headline, proper badge, and back-link as a clean text
 *    link (not a full button) above the heading.
 *
 * 2. FILTER BAR: Track filters are pill toggles (not full btn-primary/
 *    secondary switches). Search input is in a clean white rounded input
 *    with an icon — properly inline, not in a glass panel.
 *
 * 3. PROJECT CARDS: Rebuilt from scratch:
 *    - Image container has a gradient overlay at the bottom so the track
 *      badge on top right is legible on any background.
 *    - Track badge is styled with an accent color (blue/purple/green).
 *    - Author name gets a small avatar-initial circle.
 *    - Like button has a proper hover state and count badge.
 *    - "View Project" link replaced with a properly styled CTA row.
 *    - Cards lift on hover with box-shadow transition.
 *
 * 4. EMPTY STATE: Illustrated icon tile + title + sub instead of bare
 *    opacity text.
 *
 * 5. LOADING STATE: Skeleton card placeholders instead of bare "Loading..."
 *    text.
 *
 * 6. GRID: `auto-fill, minmax(320px, 1fr)` preserved — just tightened
 *    gap to 1.25rem for a more refined feel.
 *
 * 7. TYPOGRAPHY: DM Sans + Instrument Serif for brand consistency.
 *
 * 8. RESPONSIVENESS: Header wraps, filter row wraps, grid collapses
 *    gracefully on all breakpoints.
 * ─────────────────────────────────────────────────────────────────
 */

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Search, Heart, MessageCircle, ExternalLink, ArrowLeft, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ─── Styles ──────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

    :root {
      --pj-blue-50:   #eff6ff;
      --pj-blue-100:  #dbeafe;
      --pj-blue-200:  #bfdbfe;
      --pj-blue-500:  #3b82f6;
      --pj-blue-600:  #2563eb;
      --pj-blue-700:  #1d4ed8;
      --pj-purple-100:#f3e8ff;
      --pj-purple-600:#9333ea;
      --pj-green-100: #dcfce7;
      --pj-green-600: #16a34a;
      --pj-red-500:   #ef4444;
      --pj-gray-50:   #f9fafb;
      --pj-gray-100:  #f3f4f6;
      --pj-gray-200:  #e5e7eb;
      --pj-gray-300:  #d1d5db;
      --pj-gray-400:  #9ca3af;
      --pj-gray-500:  #6b7280;
      --pj-gray-700:  #374151;
      --pj-gray-900:  #111827;
      --pj-font:  'DM Sans', sans-serif;
      --pj-serif: 'Instrument Serif', serif;
      --pj-r-lg: 16px; --pj-r-xl: 20px;
      --pj-shadow-xs: 0 1px 2px rgba(0,0,0,.05);
      --pj-shadow-sm: 0 2px 8px rgba(0,0,0,.06);
      --pj-shadow-md: 0 6px 24px rgba(0,0,0,.09);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--pj-font); color: var(--pj-gray-900); background: #f8fafc; -webkit-font-smoothing: antialiased; }

    /* ── Shell ── */
    .pj-page { display: flex; flex-direction: column; min-height: 100vh; }
    .pj-main { flex: 1; }

    /* ── Hero header ── */
    .pj-hero {
      padding: 3.5rem 1.5rem 2.5rem;
      background:
        radial-gradient(ellipse 80% 60% at 70% -20%, rgba(59,130,246,.10) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 5%  110%, rgba(29,78,216,.06) 0%, transparent 55%),
        #ffffff;
      border-bottom: 1px solid var(--pj-gray-200);
    }
    .pj-hero-inner { max-width: 1200px; margin: 0 auto; }

    .pj-back-link {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: .75rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
      color: var(--pj-blue-600); text-decoration: none; margin-bottom: 1.25rem;
      opacity: .8; transition: opacity .2s;
    }
    .pj-back-link:hover { opacity: 1; }

    .pj-headline {
      font-family: var(--pj-serif);
      font-size: clamp(1.8rem, 5vw, 2.9rem);
      font-weight: 400; letter-spacing: -.02em; line-height: 1.15;
      color: var(--pj-gray-900); margin-bottom: .875rem;
    }
    .pj-headline em { font-style: italic; color: var(--pj-blue-700); }
    .pj-sub { font-size: .95rem; color: var(--pj-gray-500); line-height: 1.65; max-width: 520px; margin-bottom: 2rem; }

    /* Filter + search row */
    .pj-filter-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; flex-wrap: wrap;
    }
    .pj-pills { display: flex; gap: .4rem; flex-wrap: wrap; }
    .pj-pill {
      padding: 7px 18px; border-radius: 999px;
      font-family: var(--pj-font); font-size: .8rem; font-weight: 700;
      border: 1.5px solid var(--pj-gray-200); background: white;
      color: var(--pj-gray-500); cursor: pointer;
      transition: border-color .15s, color .15s, background .15s, box-shadow .15s;
    }
    .pj-pill:hover { border-color: var(--pj-blue-200); color: var(--pj-blue-700); background: var(--pj-blue-50); }
    .pj-pill.active {
      background: var(--pj-blue-600); border-color: var(--pj-blue-600);
      color: white; box-shadow: 0 1px 4px rgba(37,99,235,.3);
    }

    /* Search */
    .pj-search-wrap {
      display: flex; align-items: center; gap: .5rem;
      background: white; border: 1.5px solid var(--pj-gray-200);
      border-radius: 999px; padding: 7px 16px;
      transition: border-color .15s, box-shadow .15s;
    }
    .pj-search-wrap:focus-within {
      border-color: var(--pj-blue-400, #60a5fa);
      box-shadow: 0 0 0 3px rgba(59,130,246,.1);
    }
    .pj-search-icon { color: var(--pj-gray-400); flex-shrink: 0; }
    .pj-search-input {
      border: none; background: transparent; outline: none;
      font-family: var(--pj-font); font-size: .875rem; font-weight: 500;
      color: var(--pj-gray-900); width: 180px;
    }
    .pj-search-input::placeholder { color: var(--pj-gray-400); }

    /* ── Content area ── */
    .pj-content { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }

    /* ── Project grid ── */
    .pj-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    /* ── Project card ── */
    .pj-card {
      background: white; border: 1px solid var(--pj-gray-200);
      border-radius: var(--pj-r-xl); overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: var(--pj-shadow-xs);
      transition: box-shadow .22s, transform .22s, border-color .22s;
    }
    .pj-card:hover { box-shadow: var(--pj-shadow-md); transform: translateY(-3px); border-color: var(--pj-gray-300); }

    /* Card image */
    .pj-card-img-wrap {
      position: relative; height: 185px; overflow: hidden; flex-shrink: 0;
    }
    .pj-card-img {
      width: 100%; height: 100%; object-fit: cover; object-position: top;
      background-size: cover; background-position: top center;
      transition: transform .4s ease;
    }
    .pj-card:hover .pj-card-img { transform: scale(1.03); }
    /* Gradient overlay at bottom of image */
    .pj-card-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,.25) 0%, transparent 50%);
      pointer-events: none;
    }
    /* Track badge */
    .pj-track-badge {
      position: absolute; top: 10px; right: 10px;
      font-size: .6rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
      padding: 3px 10px; border-radius: 999px;
      backdrop-filter: blur(6px);
    }
    .pj-track-badge.frontend  { background: rgba(37,99,235,.85);  color: white; }
    .pj-track-badge.backend   { background: rgba(147,51,234,.85); color: white; }
    .pj-track-badge.fullstack { background: rgba(22,163,74,.85);  color: white; }
    .pj-track-badge.default   { background: rgba(0,0,0,.5);       color: white; }

    /* Card body */
    .pj-card-body { padding: 1.4rem; display: flex; flex-direction: column; gap: .75rem; flex: 1; }

    /* Author row */
    .pj-author-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
    .pj-author {
      display: flex; align-items: center; gap: .6rem; min-width: 0;
    }
    .pj-avatar {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--pj-blue-500), var(--pj-blue-700));
      color: white; font-size: .75rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .pj-author-name { font-size: .8rem; font-weight: 700; color: var(--pj-blue-600); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Like button */
    .pj-like-btn {
      display: flex; align-items: center; gap: .3rem;
      padding: 5px 10px; border-radius: 999px; border: 1.5px solid var(--pj-gray-200);
      background: white; cursor: pointer; flex-shrink: 0;
      transition: border-color .15s, background .15s, color .15s;
    }
    .pj-like-btn:hover { border-color: #fca5a5; background: #fef2f2; }
    .pj-like-btn.liked { border-color: #fca5a5; background: #fef2f2; }
    .pj-like-count { font-size: .78rem; font-weight: 700; color: var(--pj-gray-500); }
    .pj-like-btn.liked .pj-like-count { color: var(--pj-red-500); }

    /* Project title */
    .pj-card-title {
      font-size: 1rem; font-weight: 800; color: var(--pj-gray-900);
      text-decoration: none; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .pj-card-title:hover { color: var(--pj-blue-700); }

    /* Description */
    .pj-card-desc {
      font-size: .82rem; color: var(--pj-gray-500); line-height: 1.6;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Card footer */
    .pj-card-footer {
      margin-top: auto; padding-top: 1rem;
      border-top: 1px solid var(--pj-gray-100);
      display: flex; align-items: center; justify-content: space-between;
    }
    .pj-view-link {
      font-size: .78rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
      color: var(--pj-blue-600); text-decoration: none;
      display: flex; align-items: center; gap: .3rem;
      transition: color .15s, gap .15s;
    }
    .pj-view-link:hover { color: var(--pj-blue-700); gap: .5rem; }

    /* ── Skeleton cards ── */
    .pj-skeleton {
      background: white; border: 1px solid var(--pj-gray-200);
      border-radius: var(--pj-r-xl); overflow: hidden;
      box-shadow: var(--pj-shadow-xs);
    }
    .pj-skeleton-img { height: 185px; background: var(--pj-gray-100); animation: pj-shimmer 1.4s ease-in-out infinite; }
    .pj-skeleton-body { padding: 1.4rem; display: flex; flex-direction: column; gap: .75rem; }
    .pj-skeleton-line {
      height: 12px; border-radius: 999px; background: var(--pj-gray-100);
      animation: pj-shimmer 1.4s ease-in-out infinite;
    }
    @keyframes pj-shimmer {
      0%,100% { opacity: 1; } 50% { opacity: .45; }
    }

    /* ── Empty state ── */
    .pj-empty {
      grid-column: 1 / -1;
      display: flex; flex-direction: column; align-items: center;
      padding: 5rem 2rem; text-align: center;
    }
    .pj-empty-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: var(--pj-blue-50); color: var(--pj-blue-300);
      display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
    }
    .pj-empty-title { font-size: 1rem; font-weight: 700; color: var(--pj-gray-700); margin-bottom: .4rem; }
    .pj-empty-sub   { font-size: .85rem; color: var(--pj-gray-400); max-width: 300px; line-height: 1.6; }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .pj-hero { padding: 2.5rem 1rem 2rem; }
      .pj-content { padding: 1.5rem 1rem 4rem; }
      .pj-search-input { width: 120px; }
      .pj-filter-row { flex-direction: column; align-items: flex-start; }
    }
  `}</style>
);

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => { fetchProjects(); }, []);

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

  const filteredProjects = projects.filter(p => {
    const matchTrack = activeTrack === "all" || p.student?.track?.toLowerCase() === activeTrack.toLowerCase();
    const matchSearch = !searchQuery || (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchTrack && matchSearch;
  });

  const trackBadgeClass = (track: string) => {
    const t = (track || "").toLowerCase();
    if (t === "frontend")  return "pj-track-badge frontend";
    if (t === "backend")   return "pj-track-badge backend";
    if (t === "fullstack") return "pj-track-badge fullstack";
    return "pj-track-badge default";
  };

  const dashboardHref = user?.is_admin ? "/dashboard/admin" : user?.role === "instructor" ? "/dashboard/instructor" : "/dashboard/student";

  return (
    <>
      <GlobalStyles />
      <div className="pj-page">
        <Navbar />
        <main className="pj-main">

          {/* ── Hero header ── */}
          <section className="pj-hero">
            <div className="pj-hero-inner">

              {/* Back link — only if logged in */}
              {user && (
                <div>
                  <Link href={dashboardHref} className="pj-back-link">
                    <ArrowLeft size={12} /> Back to Dashboard
                  </Link>
                </div>
              )}

              <h1 className="pj-headline">
                Project <em>Showcase</em>
              </h1>
              <p className="pj-sub">
                Explore real-world applications built by our students. Filter by track or search below.
              </p>

              {/* Filters + search */}
              <div className="pj-filter-row">
                <div className="pj-pills">
                  {["all", "frontend", "backend", "fullstack"].map(t => (
                    <button
                      key={t}
                      className={`pj-pill${activeTrack === t ? " active" : ""}`}
                      onClick={() => setActiveTrack(t)}
                    >
                      {t === "all" ? "All Projects" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="pj-search-wrap">
                  <Search size={15} className="pj-search-icon" />
                  <input
                    type="text"
                    placeholder="Search projects…"
                    className="pj-search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Grid ── */}
          <div className="pj-content">
            <div className="pj-grid">

              {loading ? (
                /* Skeleton cards */
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="pj-skeleton">
                    <div className="pj-skeleton-img" />
                    <div className="pj-skeleton-body">
                      <div className="pj-skeleton-line" style={{ width: "40%" }} />
                      <div className="pj-skeleton-line" style={{ width: "80%" }} />
                      <div className="pj-skeleton-line" style={{ width: "65%" }} />
                    </div>
                  </div>
                ))
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((proj) => {
                  const previewUrl = proj.demo_link
                    ? `https://api.microlink.io?url=${encodeURIComponent(proj.demo_link)}&screenshot=true&meta=false&embed=screenshot.url`
                    : `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80`;

                  const initials = [proj.student?.first_name?.[0], proj.student?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

                  return (
                    <div key={proj.id} className="pj-card">

                      {/* Image */}
                      <Link href={`/projects/${proj.id}`} style={{ display: "block", textDecoration: "none" }}>
                        <div className="pj-card-img-wrap">
                          <div
                            className="pj-card-img"
                            style={{ backgroundImage: `url(${previewUrl})` }}
                          />
                          <div className="pj-card-img-overlay" />
                          <span className={trackBadgeClass(proj.student?.track)}>
                            {proj.student?.track || "Project"}
                          </span>
                        </div>
                      </Link>

                      {/* Body */}
                      <div className="pj-card-body">

                        {/* Author + like */}
                        <div className="pj-author-row">
                          <div className="pj-author">
                            <div className="pj-avatar">{initials}</div>
                            <span className="pj-author-name">{proj.student?.first_name} {proj.student?.last_name}</span>
                          </div>
                          <button
                            className={`pj-like-btn${proj.has_liked ? " liked" : ""}`}
                            onClick={(e) => { e.preventDefault(); handleLike(proj.id, proj.has_liked); }}
                          >
                            <Heart
                              size={14}
                              fill={proj.has_liked ? "var(--pj-red-500)" : "none"}
                              color={proj.has_liked ? "var(--pj-red-500)" : "var(--pj-gray-400)"}
                            />
                            <span className="pj-like-count">{proj.likes_count}</span>
                          </button>
                        </div>

                        {/* Title */}
                        <Link href={`/projects/${proj.id}`} className="pj-card-title">
                          {proj.title || "Untitled Project"}
                        </Link>

                        {/* Description */}
                        <p className="pj-card-desc">
                          {proj.description || "A dedicated project built at Devoria."}
                        </p>

                        {/* Footer */}
                        <div className="pj-card-footer">
                          <Link href={`/projects/${proj.id}`} className="pj-view-link">
                            View Project <ArrowLeft size={12} style={{ transform: "rotate(180deg)" }} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pj-empty">
                  <div className="pj-empty-icon"><Layout size={24} /></div>
                  <p className="pj-empty-title">
                    No projects yet for {activeTrack === "all" ? "the showcase" : activeTrack}
                  </p>
                  <p className="pj-empty-sub">
                    Check back later to see the amazing work from our {activeTrack !== "all" ? activeTrack : ""} students!
                  </p>
                </div>
              )}

            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}