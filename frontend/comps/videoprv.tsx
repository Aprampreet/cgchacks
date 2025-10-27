"use client";
import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TemporalSegment {
  start: number;
  end: number;
  confidence: number;
}

interface VideoPreviewProps {
  videoUrl: string;
  temporalData: TemporalSegment[];
}

export default function VideoPreview({ videoUrl, temporalData }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentConfidence, setCurrentConfidence] = useState<number | null>(null);

  const totalDuration = temporalData?.[temporalData.length - 1]?.end || 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const seg = temporalData.find(
        (s) => video.currentTime >= s.start && video.currentTime <= s.end
      );
      setCurrentConfidence(seg?.confidence ?? null);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [temporalData]);

  const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickTime = (clickX / rect.width) * totalDuration;
    videoRef.current.currentTime = clickTime;
  };

  const getColor = (confidence: number) => {
    if (confidence >= 0.85) return "from-green-400 to-emerald-600";
    if (confidence >= 0.7) return "from-yellow-400 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  const playbackPercent = (currentTime / totalDuration) * 100;
  if (!videoUrl || !temporalData?.length) return null;

  return (
    <div className="w-full space-y-4 mt-6">
      <div className="relative rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.6)]">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full rounded-xl border border-neutral-800"
        />

        <AnimatePresence>
          {currentConfidence !== null && (
            <motion.div
              key={currentConfidence}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute bottom-5 right-5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white backdrop-blur-md border
                ${currentConfidence >= 0.85
                  ? "bg-emerald-600/70 border-emerald-400/30"
                  : currentConfidence >= 0.7
                  ? "bg-amber-600/70 border-amber-400/30"
                  : "bg-rose-600/70 border-rose-400/30"}
              `}
            >
              {(currentConfidence * 100).toFixed(1)}% Confidence
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📊 Confidence Timeline */}
      <div
        className="relative w-full h-5 flex rounded-lg overflow-hidden border border-neutral-700 cursor-pointer bg-neutral-950 group"
        onClick={handleTimelineClick}
      >
        {temporalData.map((seg, i) => {
          const widthPercent = ((seg.end - seg.start) / totalDuration) * 100;
          return (
            <div
              key={i}
              className={`h-full bg-gradient-to-r ${getColor(
                seg.confidence
              )} transition-all duration-300 group-hover:opacity-90`}
              style={{ width: `${widthPercent}%` }}
            >
              {/* Tooltip */}
              <div className="hidden group-hover:flex absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md shadow-lg">
                {`${seg.start}s–${seg.end}s | ${(seg.confidence * 100).toFixed(1)}%`}
              </div>
            </div>
          );
        })}

        {/* 🔘 Playback Indicator */}
        <motion.div
          className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          animate={{ left: `${playbackPercent}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>

      {/* 🕒 Labels */}
      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
        <span>0s</span>
        {temporalData.map((seg, idx) => (
          <span key={idx}>{seg.end}s</span>
        ))}
      </div>
    </div>
  );
}
