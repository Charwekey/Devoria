"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
        if (user.is_admin) router.push("/dashboard/admin");
        else if (user.role === "instructor") router.push("/dashboard/instructor");
        else if (user.role === "assistant") router.push("/dashboard/assistant");
        else router.push("/dashboard/student");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email.toLowerCase().trim());
      formData.append("password", password);

      const res = await api.post("/users/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      toast.success("Successfully logged in!");
      login(res.data.access_token, res.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Invalid email or password.");
      setLoginLoading(false);
    }
  };

  if (loading || user) return null;

  return (
    <>
      <Navbar />
      <main className="app-container" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1rem" }}>
        <Card style={{ maxWidth: "440px", width: "100%", padding: "3rem 2rem", textAlign: "center" }} className="animate-fade-in">
          
          <div className="flex-center" style={{ marginBottom: "2rem" }}>
            <div style={{ background: "rgba(37, 99, 235, 0.1)", padding: "1rem", borderRadius: "50%", color: "var(--color-primary)" }}>
              <GraduationCap size={32} />
            </div>
          </div>
          
          <h2 className="text-h2" style={{ marginBottom: "0.5rem" }}>Welcome back</h2>
          <p className="text-body" style={{ marginBottom: "2.5rem" }}>Sign in to continue to Devoria</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "left" }}>
            <div>
              <label className="text-small" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", background: "rgba(255, 255, 255, 0.5)", outline: "none" }} 
              />
            </div>
            
            <div>
              <div className="flex-between" style={{ marginBottom: "0.5rem" }}>
                <label className="text-small" style={{ fontWeight: 600 }}>Password</label>
                <a href="#" className="text-small" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.75rem 2.5rem 0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--color-border)", background: "rgba(255, 255, 255, 0.5)", outline: "none" }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-subtle)", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loginLoading} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-small" style={{ marginTop: "2rem", color: "var(--color-text-subtle)" }}>
            Don't have an account? <Link href="/register" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Apply for the program</Link>
          </p>
        </Card>
      </main>
      <Footer />
    </>
  );
}
