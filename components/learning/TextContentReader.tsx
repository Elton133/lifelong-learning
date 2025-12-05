'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import type { TextContent } from '@/types/database';

interface TextContentReaderProps {
  config: TextContent;
  onComplete: (score: number) => void;
  isFullscreen: boolean;
}

// Reading completion thresholds
const MIN_READING_TIME_MULTIPLIER = 0.5; // User must spend at least 50% of estimated time
const QUICK_READ_SCORE = 70; // Score for users who read too quickly
const FULL_READ_SCORE = 100; // Score for users who read thoroughly

export default function TextContentReader({
  config,
  onComplete,
  isFullscreen,
}: TextContentReaderProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const startTimeRef = useRef<number>(0);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);

  const sections = config.sections || [];
  const hasSections = sections.length > 0;

  useEffect(() => {
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    // Track section as read when user spends time on it
    const timer = setTimeout(() => {
      setReadSections((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentSection);
        return newSet;
      });
    }, 3000); // Consider section read after 3 seconds

    return () => clearTimeout(timer);
  }, [currentSection]);

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleComplete = () => {
    const timeSpent = (Date.now() - startTimeRef.current) / 1000 / 60; // in minutes
    const estimatedTime = config.reading_time || 5;
    
    // Calculate score based on completion and time spent
    let score = FULL_READ_SCORE;
    
    // If user rushes through (spends less than 50% of estimated time), reduce score
    if (timeSpent < estimatedTime * MIN_READING_TIME_MULTIPLIER) {
      score = QUICK_READ_SCORE;
    }
    
    // If user reads all sections thoroughly, give full score
    if (hasSections && readSections.size === sections.length) {
      score = FULL_READ_SCORE;
    }

    setHasCompletedReading(true);
    onComplete(score);
  };

  const progressPercentage = hasSections
    ? ((currentSection + 1) / sections.length) * 100
    : readSections.size > 0
    ? 100
    : 0;

  return (
    <div className={`space-y-6 ${isFullscreen ? 'h-full flex flex-col' : ''}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {config.content_type === 'passage' ? (
            <BookOpen className="w-5 h-5 text-primary" />
          ) : (
            <FileText className="w-5 h-5 text-primary" />
          )}
          <h2 className="text-xl font-bold">
            {config.content_type === 'passage' ? 'Reading Material' : 'PDF Document'}
          </h2>
          {config.reading_time && (
            <Badge variant="outline">
              {config.reading_time} min read
            </Badge>
          )}
        </div>

        {hasSections && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Section {currentSection + 1} of {sections.length}
              </span>
              <span className="text-muted-foreground">
                {readSections.size} / {sections.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        )}
      </div>

      {/* Content Area */}
      <Card className={`${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
        <CardContent className={`${isFullscreen ? 'h-full overflow-auto' : 'py-8 px-6'}`}>
          {config.content_type === 'passage' && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {hasSections ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">
                      {sections[currentSection].title}
                    </h3>
                    <div className="whitespace-pre-wrap leading-relaxed text-base">
                      {sections[currentSection].content}
                    </div>
                  </div>

                  {/* Section Indicator */}
                  <div className="flex items-center justify-center gap-2 pt-4">
                    {sections.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSection(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSection
                            ? 'bg-primary w-8'
                            : readSections.has(index)
                            ? 'bg-primary/50'
                            : 'bg-border'
                        }`}
                        aria-label={`Go to section ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-base">
                  {config.text_passage}
                </div>
              )}
            </div>
          )}

          {config.content_type === 'pdf' && config.pdf_url && (
            <div className={`${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
              <iframe
                src={config.pdf_url}
                className="w-full h-full border-0 rounded"
                title="PDF Document"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between gap-4">
        {hasSections && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevSection}
              disabled={currentSection === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextSection}
              disabled={currentSection === sections.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleComplete}
          disabled={hasCompletedReading}
          className="gap-2 ml-auto"
        >
          {hasCompletedReading ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </Button>
      </div>

      {/* Reading Progress Info */}
      {!hasCompletedReading && (
        <div className="text-xs text-muted-foreground text-center">
          Take your time reading the content. Your progress is being tracked.
        </div>
      )}
    </div>
  );
}
