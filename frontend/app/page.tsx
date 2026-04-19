"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { LayoutDashboard, Users, Trophy, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if session exists
  useEffect(() => {
    if (!loading && user) {
      if (user.is_admin) router.push("/dashboard/admin");
      else if (user.role === "instructor") router.push("/dashboard/instructor");
      else if (user.role === "assistant") router.push("/dashboard/assistant");
      else router.push("/dashboard/student");
    }
  }, [user, loading, router]);

  // Prevent flash of landing page content for logged in users
  if (loading || user) return (
    <div className="flex-center" style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
       <div className="text-body animate-pulse">Safely redirecting...</div>
    </div>
  );

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ padding: "6rem 0 4rem 0", overflow: "hidden" }}>
        <div className="container" style={{ alignItems: "center", textAlign: "center", gap: "2rem" }}>
          <div className="flex-column gap-3 animate-fade-in" style={{ alignItems: "center" }}>
            <div className="badge badge-blue">Tech4Girls Initiative</div>
            <h1 className="text-h1">
              Where Learning Meets <br />
              <span className="text-gradient">Real-World Impact</span>
            </h1>
            <p className="text-body" style={{ fontSize: "1.2rem", maxWidth: "600px" }}>
              Track progress. Build projects. Showcase your growth. Devoria gives you the space to turn learning into visible results efficiently.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" className="btn btn-primary">Join Now <ChevronRight size={18} /></Link>
              <Link href="/projects" className="btn btn-secondary">Explore Projects</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "4rem 0", background: "rgba(255, 255, 255, 0.3)" }}>
        <div className="container flex-column gap-4 text-center">
          <div>
            <h2 className="text-h2">What Devoria Does</h2>
            <p className="text-body" style={{ marginTop: "1rem" }}>Everything you need to excel in your learning journey</p>
          </div>
          
          <div className="grid-cols-3 gap-3" style={{ textAlign: "left" }}>
            <Card hoverEffect>
              <LayoutDashboard size={32} color="var(--color-primary)" style={{ marginBottom: "1.5rem" }} />
              <h3 className="text-h3" style={{ marginBottom: "0.5rem" }}>Track Learning</h3>
              <p className="text-body">Gain insights by viewing assignments and tasks aligned structurally with database metrics.</p>
            </Card>
            <Card hoverEffect>
              <Users size={32} color="var(--color-accent-purple)" style={{ marginBottom: "1.5rem" }} />
              <h3 className="text-h3" style={{ marginBottom: "0.5rem" }}>Manage Classes</h3>
              <p className="text-body">Instructors can manage cohorts natively, track active users, and handle grading operations directly.</p>
            </Card>
            <Card hoverEffect>
              <Trophy size={32} color="var(--color-accent-green)" style={{ marginBottom: "1.5rem" }} />
              <h3 className="text-h3" style={{ marginBottom: "0.5rem" }}>Showcase Projects</h3>
              <p className="text-body">Public portfolios constructed dynamically straight from our FastAPI backend records.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section style={{ padding: "6rem 0" }}>
         <div className="container grid-cols-2 gap-4">
           <Card hoverEffect style={{ background: "linear-gradient(135deg, rgba(37, 99, 235, 0.05), transparent)" }}>
             <div className="badge badge-blue">Students</div>
             <h2 className="text-h2" style={{ margin: "1rem 0" }}>Track your growth</h2>
             <p className="text-body" style={{ marginBottom: "2rem" }}>Submit assignments, monitor your attendance, and build a premium portfolio of your work as you learn natively.</p>
           </Card>
           
           <Card hoverEffect style={{ background: "linear-gradient(135deg, rgba(167, 139, 250, 0.05), transparent)" }}>
             <div className="badge badge-purple">Instructors</div>
             <h2 className="text-h2" style={{ margin: "1rem 0" }}>Manage with ease</h2>
             <p className="text-body" style={{ marginBottom: "2rem" }}>See class metrics at a glance remotely, click to grade submissions inline, and manage your students correctly.</p>
           </Card>
         </div>
      </section>
      
      <Footer />
    </>
  );
}
