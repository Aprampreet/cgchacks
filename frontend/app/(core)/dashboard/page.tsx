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
  Legend,
} from "recharts";
import {
  Database,
  GitFork,
  Clock,
  TrendingUp,
  Activity,
  FileType,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

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

const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];
const STATUS_COLORS = {
  completed: "#10b981",
  failed: "#ef4444",
  pending: "#f59e0b",
  processing: "#3b82f6",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-gray-400 text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <p className="text-red-400 text-lg">{error || "Failed to load data"}</p>
        <button
          onClick={() => fetchDashboard()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const { stats, recent_scans } = data;

  const mediaTypeData = Object.entries(stats.by_media_type).map(
    ([key, value]) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value })
  );
  
  const statusData = Object.entries(stats.by_status).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || COLORS[0],
  }));

  const confidenceData = [
    {
      name: "Confidence",
      value: Math.round(stats.average_confidence ?? 0),
      fill: "#06b6d4",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0b] border border-cyan-500/30 rounded-lg p-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <p className="text-gray-300 font-medium">{payload[0].name}</p>
          <p className="text-cyan-400 font-bold text-lg">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            <Database className="w-7 h-7 text-cyan-400" />
            System Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitor your deepfake detection analytics
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-2 text-cyan-300 hover:text-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh dashboard"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="group relative p-6 bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] rounded-xl border border-white/5 hover:border-cyan-500/40 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                Total Scans
              </h2>
              <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-br from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              {stats.total_scans.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>All time</span>
            </div>
          </div>
        </div>

        <div className="group relative p-6 bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] rounded-xl border border-white/5 hover:border-green-500/40 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                Avg Confidence
              </h2>
              <TrendingUp className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
              {stats.average_confidence?.toFixed(1) ?? "N/A"}
              {stats.average_confidence && <span className="text-2xl">%</span>}
            </p>
            <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${stats.average_confidence ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group relative p-6 bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] rounded-xl border border-white/5 hover:border-purple-500/40 transition-all duration-300 overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                Media Types
              </h2>
              <FileType className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {Object.keys(stats.by_media_type).length}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(stats.by_media_type).map((type, idx) => (
                <span
                  key={type}
                  className="px-2 py-1 text-xs bg-purple-500/10 border border-purple-500/20 rounded-md text-purple-300"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart: Media Types */}
        <div className="bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] border border-white/5 p-6 rounded-xl hover:border-cyan-500/20 transition-all">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
            <GitFork className="w-5 h-5 text-cyan-400" />
            Media Distribution
          </h2>
          {mediaTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={mediaTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#374151", strokeWidth: 1 }}
                >
                  {mediaTypeData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={COLORS[i % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Bar Chart: Status */}
        <div className="bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] border border-white/5 p-6 rounded-xl hover:border-cyan-500/20 transition-all">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
            <Activity className="w-5 h-5 text-cyan-400" />
            Scan Status
          </h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Radial Chart: Confidence */}
        <div className="bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] border border-white/5 p-6 rounded-xl hover:border-cyan-500/20 transition-all flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Confidence Score
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={250} height={250}>
                <RadialBarChart
                  innerRadius="75%"
                  outerRadius="100%"
                  data={confidenceData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background={{ fill: "#1f2937" }}
                    dataKey="value"
                    cornerRadius={10}
                    fill="#06b6d4"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold bg-gradient-to-br from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                  {Math.round(stats.average_confidence ?? 0)}%
                </p>
                <p className="text-sm text-gray-400 mt-1">Average</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-200">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Scans
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-white/5">
                <th className="px-6 py-4 text-left font-semibold">Session ID</th>
                <th className="px-6 py-4 text-left font-semibold">Media Type</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Confidence</th>
                <th className="px-6 py-4 text-left font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {recent_scans.length > 0 ? (
                recent_scans.map((scan, idx) => (
                  <tr
                    key={scan.session_id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300 font-mono text-sm">
                      #{scan.session_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-300 text-sm capitalize">
                        <FileType className="w-3 h-3" />
                        {scan.media_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 capitalize text-sm font-medium">
                        {getStatusIcon(scan.status)}
                        <span
                          className={`${
                            scan.status === "completed"
                              ? "text-green-400"
                              : scan.status === "failed"
                              ? "text-red-400"
                              : scan.status === "processing"
                              ? "text-blue-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {scan.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {scan.final_confidence !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                              style={{ width: `${scan.final_confidence}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm font-medium">
                            {scan.final_confidence.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(scan.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No recent scans available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}