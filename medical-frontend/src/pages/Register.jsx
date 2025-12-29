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
    <div className="flex min-h-screen items-center justify-center auth-gradient p-6">
      <div className="w-full max-w-[440px] animate-in">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center w-20 h-20 rounded-[24px] bg-primary shadow-[0_12px_24px_-4px_rgba(59,130,246,0.3)] mb-6 transition-transform hover:scale-105">
            <HeartPulse className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            MedConnect
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Intelligent Health Management
          </p>
        </div>

        <Card className="premium-card">
          <CardHeader className="space-y-2 pb-6 px-8 pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              Create account
            </CardTitle>
            <CardDescription className="text-center text-[15px]">
              Join our network of healthcare professionals
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 px-8">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700 ml-1"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field h-11 px-4"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  university
                  className="text-sm font-semibold text-slate-700 ml-1"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field h-11 px-4"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 px-8 pb-8 pt-4">
              <Button
                type="submit"
                className="btn-primary w-full h-11 text-[15px] font-semibold"
              >
                Create Account
              </Button>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-500 font-medium">
                    Already registered?
                  </span>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-slate-600">
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 transition-colors font-bold underline-offset-4 hover:underline"
                >
                  Sign in to portal
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          © 2025 MedConnect Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
