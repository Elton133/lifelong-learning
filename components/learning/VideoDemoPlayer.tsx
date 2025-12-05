'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { VideoDemoConfig, InteractiveMoment } from '@/types/database';

interface VideoDemoPlayerProps {
  config: VideoDemoConfig;
  onComplete: (score: number) => void;
  isFullscreen: boolean;
}

export default function VideoDemoPlayer({
  config,
  onComplete,
  isFullscreen,
}: VideoDemoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentMoment, setCurrentMoment] = useState<InteractiveMoment | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [momentScores, setMomentScores] = useState<{ [key: number]: boolean }>({});
  const [hasWatched75Percent, setHasWatched75Percent] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Check if user has watched 75% of the video
      if (duration > 0 && time / duration >= 0.75 && !hasWatched75Percent) {
        setHasWatched75Percent(true);
      }

      // Check for interactive moments
      if (config.interactive_moments && isPlaying) {
        const moment = config.interactive_moments.find(
          (m) => Math.abs(m.timestamp - time) < 0.5 && !momentScores[m.timestamp]
        );
        
        if (moment && !currentMoment) {
          video.pause();
          setIsPlaying(false);
          setCurrentMoment(moment);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [config.interactive_moments, currentMoment, isPlaying, momentScores, duration, hasWatched75Percent]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleQuizAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null || !currentMoment?.quiz_question) return;

    const isCorrect = selectedAnswer === currentMoment.quiz_question.correct_answer;
    setShowResult(true);
    setMomentScores((prev) => ({
      ...prev,
      [currentMoment.timestamp]: isCorrect,
    }));
  };

  const handleMomentContinue = () => {
    setCurrentMoment(null);
    setSelectedAnswer(null);
    setShowResult(false);
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleComplete = () => {
    // Calculate score based on interactive moments completed
    const totalMoments = config.interactive_moments?.length || 0;
    const correctMoments = Object.values(momentScores).filter((v) => v).length;
    
    let score = 100;
    if (totalMoments > 0) {
      const interactionScore = (correctMoments / totalMoments) * 100;
      score = Math.round((interactionScore * 0.7) + (hasWatched75Percent ? 30 : 0));
    } else if (hasWatched75Percent) {
      score = 100;
    }

    onComplete(score);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'h-[calc(100vh-16rem)]' : 'aspect-video'}`}>
        <video
          ref={videoRef}
          src={config.video_url}
          className="w-full h-full"
          onEnded={handleComplete}
        >
          {config.captions_url && (
            <track
              kind="captions"
              src={config.captions_url}
              srcLang="en"
              label="English"
              default
            />
          )}
        </video>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <div className="flex-1 text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {config.allow_speed_control && (
              <div className="flex gap-1">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => changePlaybackRate(rate)}
                    className={playbackRate === rate ? '' : 'text-white hover:bg-white/20'}
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-2 w-full bg-white/30 h-1 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Moment Overlay */}
      {currentMoment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>
                {currentMoment.type === 'quiz' && 'Quick Quiz'}
                {currentMoment.type === 'tip' && 'Pro Tip'}
                {currentMoment.type === 'highlight' && 'Important Note'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentMoment.type === 'quiz' && currentMoment.quiz_question && (
                <div className="space-y-4">
                  <p className="font-medium">{currentMoment.quiz_question.question}</p>
                  <div className="space-y-2">
                    {currentMoment.quiz_question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={showResult}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${
                          showResult
                            ? index === currentMoment.quiz_question!.correct_answer
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                              : index === selectedAnswer
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : 'border-border'
                            : selectedAnswer === index
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm shrink-0">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                          {showResult && index === currentMoment.quiz_question!.correct_answer && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                          {showResult && index === selectedAnswer && index !== currentMoment.quiz_question!.correct_answer && (
                            <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {showResult && currentMoment.quiz_question.explanation && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">Explanation:</span>{' '}
                        {currentMoment.quiz_question.explanation}
                      </p>
                    </div>
                  )}

                  {!showResult ? (
                    <Button
                      onClick={handleQuizSubmit}
                      disabled={selectedAnswer === null}
                      className="w-full"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={handleMomentContinue} className="w-full">
                      Continue Watching
                    </Button>
                  )}
                </div>
              )}

              {currentMoment.type === 'tip' && (
                <div className="space-y-4">
                  <Badge variant="primary">Tip</Badge>
                  <p className="text-muted-foreground">{currentMoment.tip_content}</p>
                  <Button onClick={handleMomentContinue} className="w-full">
                    Got it!
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
