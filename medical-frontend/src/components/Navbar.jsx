import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { HeartPulse, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/60 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary shadow-lg shadow-primary/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              MedConnect
            </h1>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider mt-1">
              Provider Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100/80 border border-slate-200/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-700">
              {user?.email}
            </span>
            <User className="w-4 h-4 text-slate-500" />
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors gap-2 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
