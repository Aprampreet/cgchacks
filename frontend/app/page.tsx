"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Shield, Scan, Brain, Sparkles, Github } from "lucide-react";

export default function LandingPage() {
  const [health, setHealth] = useState("Loading...");

  useEffect(() => {
    axios
      .get("/api/health")
      .then((res) => setHealth(res.data.status || "Online"))
      .catch(() => setHealth("Offline"));
  }, []);

  return (
    <div className="min-h-screen bg-[#070708] text-white relative overflow-hidden flex flex-col items-center justify-center px-6">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.15),transparent_60%)]" />

      {/* Hero Section */}
      <div className="relative text-center max-w-3xl mt-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-sm mb-4">
          <Sparkles size={14} />
          AI-Powered Deepfake Detection
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text leading-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          See Beyond the Fake
        </h1>
        <p className="mt-4 text-gray-400 text-lg">
          DeepVision helps you instantly identify manipulated media using our advanced AI models — whether it’s an image, video, or audio.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/upload"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all"
          >
            Start Scanning
          </Link>
          <Link
            href="/news"
            className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-semibold transition-all"
          >
            Explore News
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative mt-24 grid md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
        {[
          {
            icon: <Shield size={32} />,
            title: "Trusted Detection",
            desc: "Leverages deep neural networks and multi-modal analysis to detect fakes with high precision.",
          },
          {
            icon: <Brain size={32} />,
            title: "Adaptive Learning",
            desc: "Continuously trained on the latest datasets to stay ahead of evolving manipulation techniques.",
          },
          {
            icon: <Scan size={32} />,
            title: "Browser Extension",
            desc: "Scan any online media directly from your browser — just right-click and detect deepfakes instantly.",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="bg-gradient-to-b from-[#101012] to-[#070708] border border-white/10 p-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400/30 transition-all backdrop-blur-md"
          >
            <div className="text-cyan-400 mb-3">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="relative mt-24 mb-6 text-gray-500 text-sm flex flex-col items-center gap-2">
        <p>
          Server Status:{" "}
          <span
            className={`font-medium ${
              health === "Online" ? "text-green-400" : "text-red-400"
            }`}
          >
            {health}
          </span>
        </p>
        <a
          href="https://github.com/Aprampreet"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-white transition-all"
        >
          <Github size={16} />
          Made by DeepVision Labs
        </a>
      </footer>
    </div>
  );
}
