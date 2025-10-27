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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getScanStatus } from "@/utlis/api";
import VideoPreview from "@/comps/videoprv";

export default function ReportPage() {
  const params = useParams();
  const sessionId = Number(params.session_id);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const POLLING_INTERVAL = 5000;

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
      if (!session || ["pending", "processing"].includes(session.status)) fetchStatus();
      else clearInterval(interval);
    }, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [sessionId, session]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-cyan-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl">Loading Session #{sessionId}...</p>
      </div>
    );

  if (!session)
    return <div className="text-center text-gray-400 mt-10">No session data found.</div>;

  const result = session.result_data || {};
  const isComplete = session.status === "completed";
  const isFailed = session.status === "failed";
  const isFake = isComplete && result.is_deepfake;
  const confidence = isComplete ? (result.final_confidence * 100).toFixed(1) : "0.0";

  const getColorClass = (value: number) => {
    if (value > 0.8) return "from-red-500 to-rose-600 shadow-red-500/50";
    if (value > 0.5) return "from-amber-400 to-orange-500 shadow-amber-500/50";
    return "from-emerald-400 to-green-500 shadow-emerald-500/50";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Analysis Report #{sessionId}
        </h1>
        <Badge
          className={`text-sm font-semibold uppercase px-4 py-2 ${
            isComplete
              ? isFake
                ? "bg-gradient-to-r from-red-600 to-rose-700"
                : "bg-gradient-to-r from-green-600 to-emerald-700"
              : isFailed
              ? "bg-gradient-to-r from-red-800 to-rose-900"
              : "bg-gradient-to-r from-cyan-600 to-blue-700 animate-pulse"
          }`}
        >
          {session.status}
        </Badge>
      </div>

      <Card className="bg-neutral-940 border border-neutral-800/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            {isComplete ? (
              isFake ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )
            ) : isFailed ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            )}
            {isComplete
              ? isFake
                ? "Deepfake Detected"
                : "Authentic Media"
              : isFailed
              ? "Analysis Failed"
              : "Processing Deepfake Models"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isComplete
              ? "Final AI decision based on model output."
              : isFailed
              ? result.message
              : `Session ${sessionId} is currently processing...`}
          </CardDescription>
        </CardHeader>

        {isComplete && (
          <CardContent className="space-y-8">
            <div
              className={`text-5xl font-black text-center tracking-tight ${
                parseFloat(confidence) > 50 ? "text-red-400" : "text-green-400"
              }`}
            >
              {confidence}% Fake Likelihood
            </div>

            {result.scores && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-cyan-400" /> Model Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(result.scores).map(([key, value]) => {
                    const numVal = Number(value);
                    return (
                      <div
                        key={key}
                        className="p-5 bg-neutral-800/60 rounded-xl border border-neutral-700/60 hover:border-cyan-700 transition"
                      >
                        <p className="capitalize text-sm text-gray-400 mb-1">
                          {key.replace(/_/g, " ")}
                        </p>
                        <div
                          className={`relative h-2 w-full rounded-full bg-neutral-700 overflow-hidden`}
                        >
                          <div
                            className={`absolute inset-0 rounded-full bg-gradient-to-r ${getColorClass(
                              numVal
                            )} transition-all duration-700`}
                            style={{ width: `${numVal * 100}%` }}
                          ></div>
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

            {(session.media_type === "video" || session.media_type === "audio") &&
            result.temporal_data &&
            result.temporal_data.length > 0 && (
              <div className="space-y-3 mt-8">
                <h3 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" /> Timeline Segments
                </h3>

                {/* 🎯 Confidence Segments */}
                {result.temporal_data.map((seg: any, i: number) => (
                  <div key={i} className="flex items-center space-x-4">
                    <span className="text-sm font-mono text-gray-300 w-24">
                      {seg.start}s – {seg.end}s
                    </span>
                    <div className="relative h-2 flex-1 rounded-full bg-neutral-700 overflow-hidden">
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${getColorClass(
                          seg.confidence
                        )} transition-all duration-700`}
                        style={{ width: `${seg.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-right text-white">
                      {(seg.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}

                {session.media_type === "video" && (
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

      <div className="flex justify-between text-sm text-gray-500 pt-4">
        <span className="flex items-center gap-1">
          <Database className="w-4 h-4" />
          Created:{" "}
          {session.created_at
            ? new Date(session.created_at).toLocaleString()
            : "N/A"}
        </span>
        <span>Media Type: {session.media_type}</span>
      </div>
    </div>
  );
}
