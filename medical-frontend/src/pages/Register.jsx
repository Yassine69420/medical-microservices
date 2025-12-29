import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(email, password);
    if (success) {
      navigate("/login");
    } else {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-[420px] animate-in">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary border-black border-2 mb-6 transition-transform hover:scale-110 hover:rotate-6">
            <HeartPulse className="w-8 h-8 text-[#4f46e5]" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            MedConnect
          </h1>
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] mt-2">
            Clinic Registration
          </p>
        </div>

        <Card className="bg-card border-black border-2 rounded-[2rem] overflow-hidden shadow-sm">
          <CardHeader className="space-y-1 pb-6 px-10 pt-10 text-center">
            <CardTitle className="text-3xl font-black tracking-tighter text-foreground">
              Create Profile
            </CardTitle>
            <CardDescription className="text-muted-foreground font-bold text-sm">
              Set up your clinic login
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-10">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Clinical Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@medical.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field h-12"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 px-10 pb-10 pt-6">
              <Button
                type="submit"
                className="btn-primary w-full h-12 rounded-full"
              >
                Register
              </Button>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-black/5"></span>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                  <span className="bg-card px-3 text-muted-foreground">
                    Already onboarded?
                  </span>
                </div>
              </div>
              <p className="text-center text-sm font-bold">
                <Link
                  to="/login"
                  className="text-primary hover:underline decoration-2 underline-offset-4"
                >
                  Sign in to Portal
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">
          MedConnect v2.4
        </p>
      </div>
    </div>
  );
}
