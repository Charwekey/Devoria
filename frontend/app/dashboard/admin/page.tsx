"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  Search,
  Settings,
  ShieldAlert,
  ArrowRight,
  LogOut,
  ChevronRight,
  Monitor,
  LayoutDashboard
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [pendingStaff, setPendingStaff] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newTrack, setNewTrack] = useState("frontend");

  // Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.is_admin) {
        router.push("/dashboard/student");
      }
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [pendingRes, whitelistRes] = await Promise.all([
        api.get("/admin/pending"),
        api.get("/admin/whitelist")
      ]);
      setPendingStaff(pendingRes.data);
      setWhitelist(whitelistRes.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) fetchData();
  }, [user]);

  const handleVerify = async (userId: string) => {
    try {
      await api.post(`/admin/verify/${userId}`);
      toast.success("Security clearance granted!");
      fetchData();
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/whitelist", {
        email: newEmail,
        role: newRole,
        track: newTrack
      });
      toast.success("Email whitelisted");
      setNewEmail("");
      fetchData();
    } catch (err) {
      toast.error("Whitelist failed");
    }
  };

  const handleRemoveWhitelist = async (email: string) => {
    try {
      await api.delete(`/admin/whitelist/${email}`);
      toast.success("Identity removed");
      fetchData();
    } catch (err) {
      toast.error("De-listing failed");
    }
  };

  if (authLoading || loading || !user?.is_admin) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-white-5 rounded-full animate-spin" style={{ borderTopColor: "var(--color-terminal-indigo)" }} />
          <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase">Authenticating Clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-page flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-20 overflow-hidden">
        
        {/* Sidebar Nav */}
        <aside className="w-72 border-r-white-5 bg-obsidian-soft flex-shrink-0 p-8 hidden lg:flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <h1 className="text-sm font-black uppercase tracking-widest text-gray-500">Security Command</h1>
            </div>
            
            <nav className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian border-white-5 text-indigo-400">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-xs font-bold">Main Dashboard</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-white/5 transition-colors cursor-pointer">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">Manage Users</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-white/5 transition-colors cursor-pointer">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-bold">Global Settings</span>
              </div>
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-white-5 space-y-4">
            <div className="bg-obsidian-soft p-5 rounded-2xl border-white-5 backdrop-blur-md">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">System Pulse</span>
              <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping absolute opacity-40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 relative" />
                </div>
                <span className="text-xl font-black italic tracking-tighter text-white">{pendingStaff.length} <span className="text-[10px] uppercase font-black not-italic opacity-40 ml-1">Awaiting</span></span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 p-4 rounded-2xl text-red-500/50 transition-all w-full text-xs font-bold border border-transparent"
            >
              <LogOut className="w-4 h-4" />
              Terminate Terminal
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar relative">
          
          <div className="max-w-6xl mx-auto space-y-12">
            
            <header>
               <h2 className="text-white font-black tracking-tighter mb-2 italic" style={{ fontSize: "2.5rem" }}>DASHBOARD <span className="opacity-40">OVERVIEW</span></h2>
               <p className="text-gray-500 text-sm font-medium">Global interface for Devoria security and cohort integrity.</p>
            </header>

            <div className="grid xl:grid-cols-12 gap-10 items-start">
               
               {/* PRIMARY STATS & WHITELIST DIRECTORY */}
               <div className="xl:col-span-8 space-y-12">
                  
                  {/* PENDING QUEUE */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                       <ShieldAlert className="w-4 h-4 text-yellow-500" />
                       <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Clearance Queue</h3>
                    </div>

                    {pendingStaff.length === 0 ? (
                      <div className="p-10 rounded-3xl bg-obsidian-soft border-white-5 text-center">
                        <CheckCircle className="w-10 h-10 text-emerald-500/20 mx-auto mb-3" />
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No pending staff verifications</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {pendingStaff.map((staff: any) => (
                          <div key={staff.id} className="p-5 rounded-2xl bg-obsidian-soft border-white-5 flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-4">
                               <div className="bg-white/5 p-2 rounded-lg text-indigo-400 font-black text-xs">{staff.first_name?.[0]}</div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">{staff.role}</span>
                            </div>
                            <h4 className="text-white font-bold text-sm mb-1">{staff.first_name} {staff.last_name}</h4>
                            <p className="text-xs text-gray-500 mb-6" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{staff.email}</p>
                            <button 
                              onClick={() => handleVerify(staff.id)}
                              className="btn-premium-indigo p-2" style={{ fontSize: "9px" }}
                            >
                              Grant Clearance
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* WHITELIST TABLE */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-indigo-500" />
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Identity Registry</h3>
                       </div>
                    </div>
                    
                    <div className="obsidian-card rounded-3xl overflow-hidden">
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-white/5">
                              <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b-white-5">Identity Profile</th>
                              <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b-white-5 text-center">Protocol Track</th>
                              <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b-white-5">Registry Command</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white-5">
                            {whitelist.slice().reverse().map((entry: any) => (
                              <tr key={entry.id} className="group hover:bg-white/5">
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-2 h-2 rounded-full ${entry.is_used ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                                      <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${entry.is_used ? "text-white" : "text-gray-500"}`}>{entry.email}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">{entry.role}</span>
                                        </div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <span className="text-[10px] font-black uppercase text-gray-500 border-white-5 px-3 py-1 rounded-full group-hover:text-white transition-colors">{entry.track}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <button onClick={() => handleRemoveWhitelist(entry.email)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
               </div>

               {/* WHITELIST ENTRY */}
               <div className="xl:col-span-4 space-y-6">
                  <div className="p-8 rounded-3xl obsidian-card">
                     <h3 className="text-white text-xl font-black mb-2 tracking-tight">Security Grant</h3>
                     <p className="text-xs text-gray-500 mb-8 font-medium">Enroll a new identity into the secure registry.</p>
                     
                     <form onSubmit={handleAddWhitelist} className="space-y-6">
                        <div className="mb-4">
                           <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Target Address</label>
                           <input 
                              type="email" 
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="identity@devoria.com"
                              className="terminal-input w-full p-4 rounded-xl mt-2 text-xs"
                              required
                           />
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                           <div>
                              <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Assign Role</label>
                              <select 
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="terminal-input w-full p-4 rounded-xl mt-2 text-xs cursor-pointer"
                              >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="assistant">Assistant</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Track</label>
                              <select 
                                value={newTrack}
                                onChange={(e) => setNewTrack(e.target.value)}
                                className="terminal-input w-full p-4 rounded-xl mt-2 text-xs cursor-pointer"
                              >
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                              </select>
                           </div>
                        </div>

                        <button type="submit" className="btn-premium-white w-full py-4 text-xs">
                           Deploy Authorization
                           <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                     </form>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-indigo-500/5 border-white-5 flex items-start gap-4">
                     <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                     <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                       Identity whitelisting enables automated account creation bypass. Unverified staff entries will remain in the clearance queue.
                     </p>
                  </div>
               </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
