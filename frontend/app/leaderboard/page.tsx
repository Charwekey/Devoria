"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempting to fetch from users or mock leaderboard endpoint
    const fetchStats = async () => {
      try {
        const res = await api.get("/users/");
        // We'll just grab the students to show an active ranking visually
        setUsers(res.data?.filter((u: any) => u.role === "student") || []);
      } catch (err) {
        console.error("Leaderboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <main className="app-container" style={{ background: "rgba(255, 255, 255, 0.4)", flexGrow: 1 }}>
        <section style={{ padding: "4rem 0" }}>
          <div className="container flex-column gap-4" style={{ alignItems: "center", textAlign: "center" }}>
            
            <div className="animate-fade-in">
              <div className="badge badge-purple" style={{ marginBottom: "1rem" }}>Active Ranking</div>
              <h1 className="text-h1">Cohort <span className="text-gradient">Leaderboard</span></h1>
              <p className="text-body mt-1" style={{ maxWidth: "500px" }}>
                These are our registered students forming the cohorts.
              </p>
            </div>

            <Card className="animate-fade-in" style={{ width: "100%", maxWidth: "800px", marginTop: "1rem", animationDelay: "0.2s", padding: "1.5rem" }}>
               {loading ? (
                 <p>Loading ranking metrics...</p>
               ) : (
                 <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                   <thead>
                     <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-subtle)", fontSize: "0.875rem" }}>
                       <th style={{ padding: "1rem" }}>Member</th>
                       <th style={{ padding: "1rem" }}>Track</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.length > 0 ? users.map((item, index) => (
                       <tr key={index} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }} className="hover-lift">
                         <td style={{ padding: "1rem", fontWeight: 500, color: "var(--color-text-main)" }}>{item.first_name || 'Student'} {item.last_name}</td>
                         <td style={{ padding: "1rem" }}><span className="badge badge-blue">{item.track || 'frontend'}</span></td>
                       </tr>
                     )) : (
                       <tr><td colSpan={2} style={{ textAlign: "center", padding: "1rem" }}>No users registered.</td></tr>
                     )}
                   </tbody>
                 </table>
               )}
            </Card>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
