import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
export function PublicLayout() { return <div className="min-h-screen"><Navbar/><Outlet/><footer className="border-t border-slate-200/70 px-5 py-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Strive. Built for your next level.</footer></div>; }
