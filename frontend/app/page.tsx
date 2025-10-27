'use client';
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [health, setHealth] = useState<string>("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get("http://localhost:8000/api/core/health", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHealth(res.data.message);
      } catch (err) {
        console.error("Error fetching health:", err);
        setHealth("Failed to fetch health");
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-gray-200 shadow-inner">
      <h2 className="text-2xl font-semibold mb-2">Dashboard Overview</h2>
      <p className="text-gray-400 text-sm">{health}</p>
    </div>
  );
}
