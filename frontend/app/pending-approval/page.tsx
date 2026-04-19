"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Clock, ShieldAlert, LogOut, Loader2, Server, Activity } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

import { useRouter } from "next/navigation";

export default function PendingApproval() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [dots, setDots] = useState("");

  // Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Server className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark-page overflow-hidden font-sans">
      <Navbar />
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500 opacity-10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* Verification Status Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border-white-5 text-yellow-500 text-[10px] font-black tracking-[0.2em] uppercase mb-4">
            <Activity className="w-3 h-3" />
            Clearance Pulse Detected
          </div>
          <h1 className="text-white font-black tracking-tighter italic leading-none" style={{ fontSize: "clamp(3rem, 10vw, 6rem)" }}>
            IDENTITY <span className="text-indigo-500">PENDING</span>
          </h1>
          <div className="h-1.5 w-32 bg-indigo-500 mx-auto rounded-full mt-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center obsidian-card p-12 rounded-3xl shadow-2xl relative">
          
          {/* Visual Indicator */}
          <div className="relative flex justify-center py-12">
            <div className="relative w-64 h-64">
               {/* Pulsing Outer Ring */}
               <div className="absolute inset-0 border-2 border-indigo-500 opacity-20 rounded-full animate-ping" />
               <div className="absolute inset-4 border-white-5 rounded-full" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-8 rounded-full bg-indigo-500/10 border-white-5 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                    <Server className="w-24 h-24 text-indigo-500" />
                  </div>
               </div>
               
               {/* Orbital Status */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-lg bg-obsidian border-white-5 text-[10px] font-black text-gray-400">
                  SEC-LEVEL: {user?.role?.toUpperCase()}
               </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-white text-3xl font-black mb-4">Awaiting Signal{dots}</h2>
              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                Welcome to Devoria, <span className="text-white font-bold">{user?.first_name}</span>. 
                Your profile has been securely synchronized with our infrastructure.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border-white-5 flex gap-4 transition-all">
                <ShieldAlert className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-1">Integrity Protocol</h4>
                  <p className="text-[13px] text-gray-500 font-medium">To protect cohort data, Instructor & Assistant roles require manual verification within 24-48 hours.</p>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-white/5 border-white-5 flex gap-4">
                <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-yellow-500 mb-1">Queue Status</h4>
                  <p className="text-[13px] text-gray-500 font-medium">Position: #1 in verification queue. Pulse active.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => window.location.reload()}
                className="btn-premium-white flex-1"
              >
                Sync Status
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              </button>
              
              <button 
                onClick={logout}
                className="btn-premium-indigo bg-white/5 border-white-5 text-gray-400 hover:text-red-500 flex-1"
                style={{ textTransform: "none" }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Terminate Session
              </button>
            </div>
          </div>
        </div>

        {/* Footer Terminal Text */}
        <div className="mt-16 flex items-center gap-8 text-[10px] font-black text-gray-700 tracking-[0.3em] uppercase">
          <span>Devoria OS v2.0.4</span>
          <div className="h-px w-24 bg-white/5" />
          <span>Security Clearance Level: Pending</span>
        </div>
      </main>
    </div>
  );
}
