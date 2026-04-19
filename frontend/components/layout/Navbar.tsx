"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Menu, X, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.is_admin) return "/dashboard/admin";
    if (user.role === "instructor") return "/dashboard/instructor";
    if (user.role === "assistant") return "/dashboard/assistant";
    return "/dashboard/student";
  };

  return (
    <header className={scrolled ? "glass-nav" : ""} style={{ padding: scrolled ? "0.75rem 0" : "1.25rem 0", position: "sticky", top: 0, zIndex: 100, transition: "all 0.3s ease" }}>
      <div className="container flex-between">
        <Link href="/" className="flex-center gap-1" style={{ textDecoration: "none", color: "var(--color-primary-dark)" }}>
          <GraduationCap size={24} color="var(--color-primary)" />
          <span className="text-h3">Devoria</span>
        </Link>
        
        <div className="flex-center gap-1">
          {!loading && user && !isAuthPage ? (
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {!isDashboard && (
                <Link href={getDashboardLink()} className="btn btn-ghost" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  <LayoutDashboard size={16} style={{ marginRight: "0.5rem" }} />
                  Dashboard
                </Link>
              )}
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column" }} className="desktop-nav">
                 <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{user.first_name} {user.last_name}</span>
                 <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "1px" }}>{user.role}</span>
              </div>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "12px", 
                background: "var(--color-primary-light)", 
                color: "var(--color-primary)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.9rem",
                border: "2px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                 {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
              <button 
                onClick={logout}
                className="btn btn-ghost" 
                style={{ padding: "0.5rem", borderRadius: "10px", color: "var(--color-error)" }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : !loading && !isDashboard && !isAuthPage && (
            <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }} className="desktop-nav">
              <Link href="/" style={{ textDecoration: "none", color: "var(--color-text-subtle)", fontWeight: 500 }} className="hover-lift">Home</Link>
              <Link href="/projects" style={{ textDecoration: "none", color: "var(--color-text-subtle)", fontWeight: 500 }} className="hover-lift">Projects</Link>
              
              <div className="flex-center gap-1" style={{ marginLeft: "1rem" }}>
                <Link href="/login" className="btn btn-ghost">Login</Link>
                <Link href="/login" className="btn btn-primary">Get Started</Link>
              </div>
            </nav>
          )}

          {!loading && !isDashboard && (
            <button 
              className="mobile-toggle" 
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: "transparent", border: "none", cursor: "pointer", display: "none" }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>
      
      {mobileOpen && !isDashboard && (
        <div className="glass-panel" style={{ position: "absolute", top: "100%", left: "1rem", right: "1rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/projects" onClick={() => setMobileOpen(false)}>Projects</Link>
          {user ? (
             <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)}>Dashboard</Link>
          ) : (
             <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
          )}
          <hr style={{ borderColor: "var(--color-border-glass)" }} />
          {user ? (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="btn btn-ghost" style={{ color: "var(--color-error)", justifyContent: "flex-start" }}>Sign Out</button>
          ) : (
            <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
          )}
        </div>
      )}
      
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
