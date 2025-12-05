'use client';

import { useState } from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { DemoConfig } from '@/types/database';
import VideoDemoPlayer from './VideoDemoPlayer';
import CodeDemoPlayer from './CodeDemoPlayer';
import DragDropDemoPlayer from './DragDropDemoPlayer';

interface InteractiveDemoPlayerProps {
  config: DemoConfig;
  onComplete: (score: number) => void;
}

export default function InteractiveDemoPlayer({
  config,
  onComplete,
}: InteractiveDemoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = (score: number) => {
    setIsCompleted(true);
    setCanReplay(true);
    onComplete(score);
  };

  const handleReplay = () => {
    setIsCompleted(false);
    setCanReplay(false);
    // Reset state - child components will handle their own reset
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderDemo = () => {
    switch (config.demo_type) {
      case 'video':
        if (!config.video_demo) return null;
        return (
          <VideoDemoPlayer
            config={config.video_demo}
            onComplete={handleComplete}
            isFullscreen={isFullscreen}
          />
        );
      case 'code':
        if (!config.code_demo) return null;
        return (
          <CodeDemoPlayer
            config={config.code_demo}
            onComplete={handleComplete}
            isFullscreen={isFullscreen}
          />
        );
      case 'drag-drop':
      case 'simulation':
        if (!config.drag_drop_demo) return null;
        return (
          <DragDropDemoPlayer
            config={config.drag_drop_demo}
            onComplete={handleComplete}
            isFullscreen={isFullscreen}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-muted-foreground">
            Demo type not supported yet
          </div>
        );
    }
  };

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto'
          : 'relative'
      }`}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {canReplay && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplay}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="gap-2"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              Fullscreen
            </>
          )}
        </Button>
      </div>

      {/* Demo Content */}
      <Card className={isFullscreen ? 'h-[calc(100vh-8rem)]' : ''}>
        <CardContent className={`${isFullscreen ? 'h-full' : 'p-6'}`}>
          {renderDemo()}
        </CardContent>
      </Card>
    </div>
  );
}
