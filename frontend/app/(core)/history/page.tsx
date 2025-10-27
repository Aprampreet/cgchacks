"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Database,
  Loader2,
  ListOrdered,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_media: string | null;
  result_data: {
    is_deepfake: boolean;
    final_confidence: number;
  } | null;
  created_at: string;
  updated_at: string;
}


const SessionCard = ({ session }: { session: SessionHistoryItem }) => {
  const router = useRouter();

  const getStatusIcon = () => {
    switch (session.status) {
      case "completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "processing": return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadgeClass = () => {
    switch (session.status) {
      case "completed": return "bg-green-600 hover:bg-green-700";
      case "failed": return "bg-red-600 hover:bg-red-700";
      case "processing": return "bg-cyan-600 hover:bg-cyan-700 animate-pulse";
      default: return "bg-yellow-600 hover:bg-yellow-700";
    }
  };

  const getResultText = () => {
    if (session.status !== 'completed' || !session.result_data) return "Analysis incomplete";
    const confidence = (session.result_data.final_confidence * 100).toFixed(1);
    const color = session.result_data.is_deepfake ? 'text-red-400' : 'text-green-400';
    const text = session.result_data.is_deepfake ? `Deepfake Detected (${confidence}%)` : `Authentic Media (${confidence}%)`;
    
    return <span className={color}>{text}</span>;
  };
  
  return (
    <Card
      className="min-screen-h bg-neutral-940 border border-neutral-800/60 shadow-lg cursor-pointer hover:border-cyan-500 transition-all duration-200"
      onClick={() => router.push(`/report/${session.session_id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0  sm:p-6">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <CardTitle className="text-xl font-bold text-white hover:text-cyan-400 transition">
              Session #{session.session_id}
            </CardTitle>
            <CardDescription className="text-sm text-gray-400">
              {getResultText()}
            </CardDescription>
          </div>
        </div>
        <Badge
          className={`text-xs font-semibold uppercase px-3 py-1 ${getStatusBadgeClass()}`}
        >
          {session.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex justify-between items-center text-xs text-gray-500 border-t border-neutral-800/60 p-4 sm:px-6 sm:py-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Media Type: {session.media_type}
        </span>
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          Scanned: {new Date(session.created_at).toLocaleDateString()}
        </span>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-cyan-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl">Loading your session history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 mt-10 p-4 border border-red-500/50 rounded-lg max-w-md mx-auto">
        <AlertCircle className="w-6 h-6 inline-block mr-2" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }
  
  // Main Render
  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <ListOrdered className="w-8 h-8 text-cyan-400" />
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Scan History
        </h1>
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="text-center text-gray-400 mt-10 p-10 border border-neutral-700 rounded-lg">
          <Database className="w-10 h-10 mx-auto mb-4 text-neutral-500" />
          <p className="text-xl font-semibold">No Scan Sessions Found</p>
          <p className="text-md">Start a new scan to see your history here.</p>
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