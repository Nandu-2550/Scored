'use client';

import React, { useState, useRef } from 'react';
import { uploadMedia } from '@/lib/cloudinary';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  folder?: 'team-logos' | 'player-profiles' | 'tournament-banners';
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export function ImageUploader({
  label,
  currentUrl,
  folder = 'team-logos',
  onUploadSuccess,
  className = '',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setIsUploading(true);

    try {
      const result = await uploadMedia(file, folder);
      setPreview(result.secure_url);
      onUploadSuccess(result.secure_url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'Upload to Cloudinary failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-3 flex items-center gap-3 transition-all ${
          error
            ? 'border-rose-500/50 bg-rose-500/5 hover:border-rose-400'
            : preview
            ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400'
            : 'border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {/* Thumbnail Preview */}
        <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-500" />
          )}
        </div>

        {/* Status / Instructions */}
        <div className="flex-1 min-w-0">
          {isUploading ? (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to Cloudinary...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          ) : preview ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Uploaded successfully • Click to replace</span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs">
              <span className="text-cyan-400 font-semibold group-hover:underline">Click to upload</span> team logo or photo
              <span className="block text-[10px] text-slate-500 mt-0.5">PNG, JPG, SVG, WebP up to 5MB</span>
            </div>
          )}
        </div>

        <UploadCloud className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
      </div>
    </div>
  );
}
