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
    <header className="sticky top-0 z-50 w-full bg-background border-b border-black">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary border-black border-2 transition-transform hover:rotate-12">
            <HeartPulse className="w-5 h-5 text-[#4f46e5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-foreground tracking-tighter leading-none">
              MedConnect
            </h1>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
              Medical Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-black shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
            <span className="text-xs font-bold text-foreground">
              {user?.email}
            </span>
            <User className="w-3 h-3 text-muted-foreground" />
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="rounded-full border-black border-2 hover:bg-destructive hover:text-white transition-all font-bold text-xs px-4"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
