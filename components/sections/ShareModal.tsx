'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { GitHubProfile, BadgeEvaluation, ScoreResult, RoadmapResult } from '@/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GitHubProfile;
  evaluations: BadgeEvaluation[];
  scores: ScoreResult;
  roadmap: RoadmapResult;
}

export default function ShareModal({
  isOpen,
  onClose,
  profile,
  evaluations,
  scores,
  roadmap,
}: ShareModalProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let url = '';
    const generatePreview = async () => {
      setIsLoading(true);
      try {
        const { generateShareCardCanvas } = await import('@/lib/services/share-service');
        const blob = await generateShareCardCanvas(profile, evaluations, scores);
        url = URL.createObjectURL(blob);
        setImgUrl(url);
      } catch (err) {
        console.error('Failed to generate share card preview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    generatePreview();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
      setImgUrl(null);
    };
  }, [isOpen, profile, evaluations, scores]);

  const handleDownloadPNG = async () => {
    try {
      const { generateShareCardCanvas } = await import('@/lib/services/share-service');
      const blob = await generateShareCardCanvas(profile, evaluations, scores);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.username}-github-badges.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PNG:', err);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { generatePDF } = await import('@/lib/services/share-service');
      await generatePDF(profile, evaluations, roadmap);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-2 border-[#16211a] bg-[#f7f9f6] text-[#16211a] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bricolage font-extrabold text-[#16211a] flex items-center gap-2">
            <span>📢</span> Share achievements
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Card Preview */}
          <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-[6px] border-2 border-[#16211a] bg-[#eef4ec] flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2 text-[#4f6156]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6f4a] border-t-transparent" />
                <p className="text-xs font-mono">Generating preview...</p>
              </div>
            ) : imgUrl ? (
              <img
                src={imgUrl}
                alt="Badge Achievements Share Card Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-[#4f6156]">Failed to load preview</span>
            )}
          </div>

          {/* Action Row */}
          <div className="grid w-full grid-cols-3 gap-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isLoading || !imgUrl}
              aria-label="Download PNG share card"
              className="flex flex-col items-center justify-center rounded-[6px] border-2 border-[#16211a] bg-white py-3 text-xs font-mono font-bold text-[#16211a] hover:bg-[#eef4ec] active:bg-[#cbd8cf] transition-all shadow-[2px_2px_0_var(--ink)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--ink)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
            >
              <span className="text-lg mb-1">🖼️</span>
              Download PNG
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isLoading}
              aria-label="Download PDF report"
              className="flex flex-col items-center justify-center rounded-[6px] border-2 border-[#16211a] bg-white py-3 text-xs font-mono font-bold text-[#16211a] hover:bg-[#eef4ec] active:bg-[#cbd8cf] transition-all shadow-[2px_2px_0_var(--ink)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--ink)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
            >
              <span className="text-lg mb-1">📄</span>
              Download PDF
            </button>
            <button
              onClick={handleCopyLink}
              aria-label="Copy share link"
              className="flex flex-col items-center justify-center rounded-[6px] border-2 border-[#16211a] bg-white py-3 text-xs font-mono font-bold text-[#16211a] hover:bg-[#eef4ec] active:bg-[#cbd8cf] transition-all shadow-[2px_2px_0_var(--ink)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--ink)] active:translate-y-[2px] active:shadow-none"
            >
              <span className="text-lg mb-1">🔗</span>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
