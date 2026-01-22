"use client";

import { Upload, Coffee, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useApp } from '@/shared/contexts/AppContext';

export function Header() {
  const { setIsUploadModalOpen, setIsPreferencesOpen, subtitleFileName } = useApp();

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight">FixSRT</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {subtitleFileName ? 'Replace Files' : 'Upload'}
        </Button>
        {subtitleFileName && (
          <span className="text-sm text-muted-foreground">
            {subtitleFileName}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer">
            <Coffee className="h-4 w-4" />
            Support
          </a>
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsPreferencesOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
