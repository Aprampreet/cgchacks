"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2, Video, Image as ImageIcon, Music, CheckCircle, AlertCircle } from 'lucide-react'; // Added CheckCircle, AlertCircle

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { uploadMedia } from '@/utlis/api';

interface Message {
  type: 'success' | 'error' | 'none';
  text: string;
}

export default function NewScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>('video');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message>({ type: 'none', text: '' });
  
  const router = useRouter();

  const mediaOptions = [
    { value: 'video', label: 'Video', icon: Video },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'image', label: 'Image', icon: ImageIcon },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage({ type: 'none', text: '' }); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: 'none', text: '' }); 

    if (!file || !mediaType) {
      setMessage({ type: 'error', text: "Please select a file and media type." });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await uploadMedia(mediaType, file);
            setMessage({
        type: 'success',
        text: `Scan accepted (ID: ${data.session_id}). Redirecting to report...`,
      });
     router.push(`/report/${data.session_id}`); 

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "File upload failed. Check file size/type.";
      setMessage({
        type: 'error',
        text: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  const Icon = mediaOptions.find(opt => opt.value === mediaType)?.icon || FileUp;

  const MessageComponent = () => {
    if (message.type === 'none') return null;

    const isError = message.type === 'error';
    const baseClasses = "p-3 rounded-lg flex items-center gap-2 text-sm font-medium";
    const statusClasses = isError 
      ? "bg-red-800/30 border border-red-700 text-red-300" 
      : "bg-green-800/30 border border-green-700 text-green-300";
    const StatusIcon = isError ? AlertCircle : CheckCircle;

    return (
      <div className={`${baseClasses} ${statusClasses}`}>
        <StatusIcon className="w-5 h-5 flex-shrink-0" />
        {message.text}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pt-10">
      <Card className="bg-white/5 border-cyan-700/50 backdrop-blur-md text-white">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Start New Deepfake Scan
          </CardTitle>
          <CardDescription className="text-gray-400">
            Upload your media to initiate the multi-modal AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <MessageComponent />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mediaType" className="text-gray-300">Media Type</Label>
              <Select value={mediaType} onValueChange={setMediaType} disabled={isSubmitting}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white hover:border-cyan-400 transition-colors">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                  {mediaOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-neutral-700">
                      <option.icon className="w-4 h-4 mr-2 inline-block" />
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file" className="text-gray-300">
                File Upload ({mediaType.toUpperCase()})
              </Label>
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="dropzone-file" 
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${file ? 'border-green-500 bg-neutral-700/50' : 'border-cyan-500/50 hover:border-cyan-400 bg-neutral-800/50'}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon className={`w-8 h-8 mb-3 ${file ? 'text-green-400' : 'text-cyan-400'}`} />
                    <p className="mb-2 text-sm text-gray-300">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 truncate w-full px-4">
                      {file ? file.name : `Max 50MB. Accepts: .mp4, .mov, .mp3, .jpg, etc.`}
                    </p>
                  </div>
                  <Input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept={mediaType === 'image' ? 'image/*' : mediaType === 'video' ? 'video/*' : 'audio/*'}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full text-lg py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-colors"
              disabled={isSubmitting || !file}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initiating Scan...
                </>
              ) : (
                "Run Deepfake Analysis"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}