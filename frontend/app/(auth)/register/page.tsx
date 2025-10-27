'use client';
import React, { useState ,useEffect } from "react";
import { registerUser } from "@/utlis/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth(); 
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent)=>{
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            const res =await registerUser(username, password, email);
            login(res.access, res.refresh);
            router.push("/");
        }catch(err){
            setError( "Registration failed");
        }finally{
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center  text-white px-4">
        <form
          onSubmit={submit}
          className="relative w-full max-w-sm backdrop-blur-xl  bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl shadow-black/40 transition-all duration-300 hover:border-white/20"
        >
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome User</h1>
            <p className="text-neutral-400 text-sm">
              Sign up to continue to your dashboard
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-900/30 border border-red-900/40 p-2 rounded-lg">
              {String(error)}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none placeholder:text-neutral-400"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none placeholder:text-neutral-400"
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 focus:outline-none placeholder:text-neutral-400"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    );
}