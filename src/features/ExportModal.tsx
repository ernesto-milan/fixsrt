"use client";

import { useState, useCallback } from 'react';
import { Download, Coffee, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { useApp } from '@/shared/contexts/AppContext';
import { generateSRT } from '@/shared/utils/srtParser';

export function ExportModal() {
  const { 
    isExportModalOpen, 
    setIsExportModalOpen,
    subtitles,
    subtitleFileName,
  } = useApp();

  const [filename, setFilename] = useState(() => {
    if (subtitleFileName) {
      return subtitleFileName.replace('.srt', '_fixed.srt');
    }
    return 'subtitles_fixed.srt';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleExport = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate SRT content
    const srtContent = generateSRT(subtitles);
    
    // Create and download file
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.srt') ? filename : `${filename}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsGenerating(false);
    setShowThankYou(true);
  }, [subtitles, filename]);

  const handleClose = () => {
    setIsExportModalOpen(false);
    setShowThankYou(false);
  };

  return (
    <Dialog open={isExportModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export SRT</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="subtitles.srt"
            />
          </div>

          <Button 
            onClick={handleExport}
            disabled={isGenerating || !filename}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download
              </>
            )}
          </Button>

          {showThankYou && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Coffee className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                If FixSRT saved you time, consider{' '}
                <a 
                  href="https://buymeacoffee.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  supporting it
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
