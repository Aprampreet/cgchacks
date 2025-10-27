"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/utlis/api";
import {
PieChart,
Pie,
Cell,
Tooltip,
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
RadialBarChart,
RadialBar,
} from "recharts";
import { Database, GitFork, Clock } from "lucide-react";

interface DashboardData {
message: string;
stats: {
total_scans: number;
by_media_type: Record<string, number>;
by_status: Record<string, number>;
average_confidence: number | null;
};
recent_scans: {
session_id: number;
media_type: string;
status: string;
final_confidence: number | null;
created_at: string;
}[];
}

const COLORS = ["#06b6d4", "#0ea5e9", "#22d3ee", "#7dd3fc"];

export default function DashboardPage() {
const [data, setData] = useState<DashboardData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchDashboard = async () => {
try {
const res = await getDashboard();
setData(res);
} catch (err) {
console.error("Failed to load dashboard:", err);
} finally {
setLoading(false);
}
};
fetchDashboard();
}, []);

if (loading) {
return ( <div className="flex items-center justify-center h-screen text-gray-400"> <div className="animate-pulse">Loading dashboard...</div> </div>
);
}

if (!data) {
return ( <div className="flex items-center justify-center h-screen text-red-400">
Failed to load data. </div>
);
}

const { stats, recent_scans } = data;

const mediaTypeData = Object.entries(stats.by_media_type).map(
([key, value]) => ({ name: key, value })
);
const statusData = Object.entries(stats.by_status).map(([key, value]) => ({
name: key,
value,
}));
const confidenceData = [
{ name: "Confidence", value: stats.average_confidence ?? 0, fill: "#06b6d4" },
];

return ( <div className="min-h-screen bg-neutral-950 text-gray-200 px-6 py-10"> <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-cyan-400"> <Database className="w-6 h-6" /> System Dashboard </h1>


  {/* Stat Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    <div className="p-5 bg-neutral-900/60 rounded-xl border border-neutral-700/60 hover:border-cyan-700 transition-all">
      <h2 className="text-gray-400 text-sm uppercase tracking-wide">
        Total Scans
      </h2>
      <p className="text-4xl font-bold text-cyan-400">{stats.total_scans}</p>
    </div>

    <div className="p-5 bg-neutral-900/60 rounded-xl border border-neutral-700/60 hover:border-cyan-700 transition-all">
      <h2 className="text-gray-400 text-sm uppercase tracking-wide">
        Avg Confidence
      </h2>
      <p className="text-4xl font-bold text-green-400">
        {stats.average_confidence ?? "N/A"}%
      </p>
    </div>

    <div className="p-5 bg-neutral-900/60 rounded-xl border border-neutral-700/60 hover:border-cyan-700 transition-all">
      <h2 className="text-gray-400 text-sm uppercase tracking-wide">
        Unique Media Types
      </h2>
      <p className="text-4xl font-bold text-yellow-400">
        {Object.keys(stats.by_media_type).length}
      </p>
    </div>
  </div>

  {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Pie: Media Types */}
    <div className="bg-neutral-900/60 border border-neutral-700/60 p-6 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-300">
        <GitFork className="w-5 h-5" /> Media Type Distribution
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={mediaTypeData} dataKey="value" nameKey="name" outerRadius={90} label>
            {mediaTypeData.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Bar: Status */}
    <div className="bg-neutral-900/60 border border-neutral-700/60 p-6 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-cyan-300">Scan Status</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={statusData}>
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
          <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Radial: Confidence */}
    <div className="bg-neutral-900/60 border border-neutral-700/60 p-6 rounded-xl flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4 text-cyan-300">Average Confidence</h2>
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={confidenceData}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            background
            clockWise
            dataKey="value"
            cornerRadius={15}
          />
          <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="text-2xl mt-2 font-bold text-green-400">
        {stats.average_confidence ?? 0}%
      </p>
    </div>
  </div>

  {/* Recent Scans */}
  <div className="mt-12">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-cyan-300">
      <Clock className="w-5 h-5" /> Recent Scans
    </h2>
    <div className="overflow-x-auto rounded-xl border border-neutral-700/60">
      <table className="min-w-full bg-neutral-900/60">
        <thead>
          <tr className="text-gray-400 text-sm border-b border-neutral-700">
            <th className="px-4 py-3 text-left">Session ID</th>
            <th className="px-4 py-3 text-left">Media Type</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Confidence</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {recent_scans.map((scan) => (
            <tr
              key={scan.session_id}
              className="border-b border-neutral-800 hover:bg-neutral-800/60 transition"
            >
              <td className="px-4 py-2 text-gray-300">{scan.session_id}</td>
              <td className="px-4 py-2 capitalize text-cyan-300">
                {scan.media_type}
              </td>
              <td
                className={`px-4 py-2 font-semibold ${
                  scan.status === "completed"
                    ? "text-green-400"
                    : scan.status === "failed"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {scan.status}
              </td>
              <td className="px-4 py-2 text-gray-300">
                {scan.final_confidence ?? "—"}
              </td>
              <td className="px-4 py-2 text-gray-400">
                {new Date(scan.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>


);
}
