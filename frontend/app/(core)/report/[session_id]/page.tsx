"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  GitFork,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getScanStatus } from "@/utlis/api";
import VideoPreview from "@/comps/videoprv";

const STATUS_STYLES = {
  completed: (isFake: boolean) => 
    isFake ? "bg-red-600" : "bg-green-600",
  failed: () => "bg-red-800",
  default: () => "bg-cyan-600 animate-pulse",
};

const getConfidenceColor = (value: number) => {
  if (value > 0.8) return "from-red-500 to-rose-600";
  if (value > 0.5) return "from-amber-400 to-orange-500";
  return "from-emerald-400 to-green-500";
};

export default function ReportPage() {
  const params = useParams();
  const sessionId = Number(params.session_id);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!sessionId) return;
    try {
      const data = await getScanStatus(sessionId);
      setSession(data);
    } catch {
      setSession({
        session_id: sessionId,
        status: "failed",
        result_data: { error: "Network Error", message: "Could not fetch status." },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (session && !["completed", "failed"].includes(session.status)) {
        fetchStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId, session?.status]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="text-gray-400 text-lg">Loading Session #{sessionId}...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center text-gray-400 mt-10">No session data found.</div>
    );
  }

  const result = session.result_data || {};
  const isComplete = session.status === "completed";
  const isFailed = session.status === "failed";
  const isFake = isComplete && result.is_deepfake;
  const confidence = isComplete ? (result.final_confidence * 100).toFixed(1) : "0.0";

  const StatusIcon = isComplete
    ? isFake ? XCircle : CheckCircle
    : isFailed ? AlertCircle : Loader2;

  const statusColor = isComplete
    ? isFake ? "text-red-500" : "text-green-500"
    : isFailed ? "text-red-500" : "text-cyan-400";

  const badgeClass = STATUS_STYLES[session.status as keyof typeof STATUS_STYLES]?.(isFake) 
    || STATUS_STYLES.default();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Analysis Report #{sessionId}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Deepfake detection results</p>
        </div>
        <Badge className={`${badgeClass} text-sm font-semibold uppercase px-4 py-2`}>
          {session.status}
        </Badge>
      </div>

      {/* Main Result Card */}
      <Card className="bg-gradient-to-br from-[#0f1114] to-[#0a0a0b] border border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white text-xl">
            <StatusIcon className={`w-6 h-6 ${statusColor} ${!isComplete && !isFailed ? 'animate-spin' : ''}`} />
            {isComplete
              ? isFake ? "Deepfake Detected" : "Authentic Media"
              : isFailed ? "Analysis Failed" : "Processing..."}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isComplete
              ? "Final AI decision based on model analysis"
              : isFailed ? result.message : `Analyzing session ${sessionId}...`}
          </CardDescription>
        </CardHeader>

        {isComplete && (
          <CardContent className="space-y-8">
            {/* Confidence Score */}
            <div className="text-center space-y-2">
              <div className={`text-5xl font-bold ${parseFloat(confidence) > 50 ? "text-red-400" : "text-green-400"}`}>
                {confidence}%
              </div>
              <p className="text-gray-400 text-sm">Deepfake Likelihood</p>
            </div>

            {/* Model Scores */}
            {result.scores && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-cyan-400" />
                  Model Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(result.scores).map(([key, value]) => {
                    const numVal = Number(value);
                    return (
                      <div
                        key={key}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/40 transition"
                      >
                        <p className="capitalize text-sm text-gray-400 mb-2">
                          {key.replace(/_/g, " ")}
                        </p>
                        <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(numVal)} transition-all duration-700`}
                            style={{ width: `${numVal * 100}%` }}
                          />
                        </div>
                        <p className="text-lg font-bold mt-2 text-white">
                          {(numVal * 100).toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline Segments */}
            {(session.media_type === "video" || session.media_type === "audio") &&
              result.temporal_data?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Timeline Analysis
                  </h3>
                  <div className="space-y-3">
                    {result.temporal_data.map((seg: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm font-mono text-gray-400 w-20">
                          {seg.start}s-{seg.end}s
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(seg.confidence)} transition-all duration-700`}
                            style={{ width: `${seg.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right text-white">
                          {(seg.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {session.media_type === "video" && session.processed_media && (
                    <VideoPreview
                      videoUrl={session.processed_media}
                      temporalData={result.temporal_data}
                    />
                  )}
                </div>
              )}
          </CardContent>
        )}
      </Card>

      {/* Footer Info */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-400 pt-4 border-t border-white/10">
        <span className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          {session.created_at ? new Date(session.created_at).toLocaleString() : "N/A"}
        </span>
        <span className="ml-auto capitalize">
          Media: {session.media_type}
        </span>
      </div>
    </div>
  );
}