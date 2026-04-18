"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={scrolled ? "glass-nav" : ""} style={{ padding: scrolled ? "0.75rem 0" : "1.25rem 0", position: "sticky", top: 0, zIndex: 50, transition: "all 0.3s ease" }}>
      <div className="container flex-between">
        <Link href="/" className="flex-center gap-1" style={{ textDecoration: "none", color: "var(--color-primary-dark)" }}>
          <GraduationCap size={24} color="var(--color-primary)" />
          <span className="text-h3">Devoria</span>
        </Link>
        
        {/* Desktop Nav - Hidden on Dashboard */}
        {!isDashboard && (
          <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }} className="desktop-nav">
            <Link href="/" style={{ textDecoration: "none", color: "var(--color-text-subtle)", fontWeight: 500 }} className="hover-lift">Home</Link>
            <Link href="/projects" style={{ textDecoration: "none", color: "var(--color-text-subtle)", fontWeight: 500 }} className="hover-lift">Projects</Link>
            <Link href="/dashboard/student" style={{ textDecoration: "none", color: "var(--color-text-subtle)", fontWeight: 500 }} className="hover-lift">Student</Link>
            <Link href="/dashboard/instructor" style={{ textDecoration: "none", color: "var(--color-text-subtle)", fontWeight: 500 }} className="hover-lift">Instructor</Link>
            
            <div className="flex-center gap-1" style={{ marginLeft: "1rem" }}>
              <Link href="/login" className="btn btn-ghost">Login</Link>
              <Link href="/login" className="btn btn-primary">Get Started</Link>
            </div>
          </nav>
        )}

        {/* Mobile Toggle - Only if not dashboard */}
        {!isDashboard && (
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "transparent", border: "none", cursor: "pointer", display: "none" }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>
      
      {/* Mobile Menu */}
      {mobileOpen && !isDashboard && (
        <div className="glass-panel" style={{ position: "absolute", top: "100%", left: "1rem", right: "1rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/projects" onClick={() => setMobileOpen(false)}>Projects</Link>
          <Link href="/dashboard/student" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <hr style={{ borderColor: "var(--color-border-glass)" }} />
          <Link href="/login" className="btn btn-primary">Login</Link>
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
