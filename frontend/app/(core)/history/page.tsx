"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Database,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileType,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserSessions } from "@/utlis/api";

interface SessionHistoryItem {
  session_id: number;
  media_type: string;
  media_url: string;
  status: "pending" | "processing" | "completed" | "failed";
  processed_media: string | null;
  result_data: {
    is_deepfake: boolean;
    final_confidence: number;
  } | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: "text-green-500", badge: "bg-green-600" },
  failed: { icon: XCircle, color: "text-red-500", badge: "bg-red-600" },
  processing: { icon: Loader2, color: "text-cyan-400", badge: "bg-cyan-600", spin: true },
  pending: { icon: Clock, color: "text-yellow-500", badge: "bg-yellow-600" },
};

const SessionCard = ({ session }: { session: SessionHistoryItem }) => {
  const router = useRouter();
  const status = STATUS_CONFIG[session.status];
  const Icon = status.icon;

  const getResultText = () => {
    if (session.status !== "completed" || !session.result_data) {
      return <span className="text-gray-400">Analysis incomplete</span>;
    }
    
    const confidence = (session.result_data.final_confidence * 100).toFixed(1);
    const isDeepfake = session.result_data.is_deepfake;
    
    return (
      <span className={isDeepfake ? "text-red-400" : "text-green-400"}>
        {isDeepfake ? "Deepfake Detected" : "Authentic Media"} ({confidence}%)
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      onClick={() => router.push(`/report/${session.session_id}`)}
      className="bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] border border-white/5 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Icon className={`w-5 h-5 ${status.color} ${status.spin ? "animate-spin" : ""}`} />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
              Session #{session.session_id}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {getResultText()}
            </CardDescription>
          </div>
        </div>
        <Badge className={`${status.badge} text-xs font-semibold uppercase px-3 py-1`}>
          {session.status}
        </Badge>
      </CardHeader>
      
      <CardContent className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-white/5 pt-3">
        <span className="flex items-center gap-1.5">
          <FileType className="w-3.5 h-3.5" />
          {session.media_type}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatDate(session.created_at)}
        </span>
        {session.result_data && (
          <span className="flex items-center gap-1.5 ml-auto">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">
              {(session.result_data.final_confidence * 100).toFixed(1)}% confidence
            </span>
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUserSessions();
        setHistory(data.history);
      } catch (err) {
        console.error("Failed to fetch session history:", err);
        setError("Could not load session history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-gray-400 text-lg">Loading your session history...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/10">
        <Database className="w-7 h-7 text-cyan-400" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Scan History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            View all your deepfake detection scans
          </p>
        </div>
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-20 px-6">
          <div className="inline-flex p-6 bg-gray-800/20 rounded-full mb-4">
            <Database className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Scan Sessions Yet
          </h3>
          <p className="text-gray-500">
            Start your first deepfake detection scan to see results here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}