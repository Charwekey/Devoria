"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "student",
    track: "frontend"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users/", formData);
      toast.success("Account created! Please log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Registration failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="app-container" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1rem" }}>
        <Card style={{ maxWidth: "500px", width: "100%", padding: "3rem 2rem", textAlign: "center" }} className="animate-fade-in">
          
          <div className="flex-center" style={{ marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(37, 99, 235, 0.1)", padding: "1rem", borderRadius: "50%", color: "var(--color-primary)" }}>
              <GraduationCap size={32} />
            </div>
          </div>
          
          <h2 className="text-h2" style={{ marginBottom: "0.5rem" }}>Join Devoria</h2>
          <p className="text-body" style={{ marginBottom: "2rem" }}>Create your account to start your journey.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "left" }}>
            
            <div className="grid-cols-2" style={{ gap: "1rem" }}>
              <div>
                <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>First Name</label>
                <input required type="text" placeholder="Sarah" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
              </div>
              <div>
                <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Last Name</label>
                <input required type="text" placeholder="Jenkins" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
              </div>
            </div>

            <div>
              <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Email Address</label>
              <input required type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
            </div>
            
            <div>
              <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Password</label>
              <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none" }} />
            </div>

            <div className="grid-cols-2" style={{ gap: "1rem" }}>
              <div>
                <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none", background: "rgba(255, 255, 255, 0.5)" }}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <div>
                <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Track</label>
                <select value={formData.track} onChange={e => setFormData({...formData, track: e.target.value})} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", outline: "none", background: "rgba(255, 255, 255, 0.5)" }}>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Fullstack</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <p className="text-small" style={{ marginTop: "2rem", color: "var(--color-text-subtle)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
