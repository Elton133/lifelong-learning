'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Star, CheckCircle, XCircle } from 'lucide-react';
import { useContent } from '@/hooks/usePlaylist';
import { contentAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { formatDuration, getDifficultyColor } from '@/lib/utils';
import type { QuizQuestion } from '@/types/database';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto">
      <div className="h-8 w-48 bg-muted rounded mb-6" />
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  );
}

// Quiz Component
function QuizPlayer({ 
  questions, 
  onComplete 
}: { 
  questions: QuizQuestion[]; 
  onComplete: (score: number) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct_answer;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    if (!showResult) {
      setShowResult(true);
      if (isCorrect) {
        setScore(prev => prev + 1);
      }
    } else {
      if (isLastQuestion) {
        const finalScore = Math.round(((score + (isCorrect ? 0 : 0)) / questions.length) * 100);
        onComplete(finalScore);
      } else {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <Progress value={(currentQuestion / questions.length) * 100} className="flex-1" />
        <span className="text-sm text-muted-foreground shrink-0">
          {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  showResult
                    ? index === question.correct_answer
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
                  {showResult && index === question.correct_answer && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                  {showResult && index === selectedAnswer && index !== question.correct_answer && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && question.explanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Explanation:</span> {question.explanation}
              </p>
            </div>
          )}

          <Button 
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full mt-6"
          >
            {!showResult ? 'Submit Answer' : isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Video Player Component
function VideoPlayer({ url }: { url: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Video Player Placeholder</p>
            <p className="text-sm text-muted-foreground mt-1">{url}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Completion Screen
function CompletionScreen({ 
  score, 
  xpEarned, 
  onClose 
}: { 
  score: number; 
  xpEarned: number; 
  onClose: () => void;
}) {
  const isPerfect = score === 100;
  const isPassing = score >= 70;

  return (
    <Card className="text-center max-w-md mx-auto">
      <CardContent className="pt-8 pb-8">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${
          isPerfect ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
          isPassing ? 'bg-green-100 dark:bg-green-900/30' : 
          'bg-orange-100 dark:bg-orange-900/30'
        }`}>
          {isPerfect ? (
            <Star className="w-10 h-10 text-yellow-500" />
          ) : (
            <CheckCircle className={`w-10 h-10 ${isPassing ? 'text-green-500' : 'text-orange-500'}`} />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {isPerfect ? 'Perfect Score!' : isPassing ? 'Great Job!' : 'Keep Practicing!'}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          You scored {score}% on this session
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="primary" size="md">
            +{xpEarned} XP
          </Badge>
        </div>

        <Button onClick={onClose} className="w-full">
          Return to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.contentId as string;
  const { content, loading } = useContent(contentId);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Content not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleComplete = async (score: number) => {
    const result = await contentAPI.completeSession(contentId, {
      performance_score: score,
      time_spent: content.estimated_duration * 60,
    });
    
    if (result.data) {
      setFinalScore(score);
      setXpEarned(result.data.xp_earned);
      setIsComplete(true);
    }
  };

  const handleVideoComplete = () => {
    handleComplete(100);
  };

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <CompletionScreen 
          score={finalScore} 
          xpEarned={xpEarned} 
          onClose={() => router.push('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Content Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{content.title}</h1>
        <p className="text-muted-foreground mt-1">{content.description}</p>
        <div className="flex items-center gap-3 mt-3">
          <Badge className={getDifficultyColor(content.difficulty)}>
            {content.difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatDuration(content.estimated_duration)}
          </span>
          <Badge variant="primary">
            +{content.xp_reward} XP
          </Badge>
        </div>
      </div>

      {/* Content Renderer */}
      {content.content_type === 'quiz' && content.content_data.quiz_questions && (
        <QuizPlayer 
          questions={content.content_data.quiz_questions} 
          onComplete={handleComplete}
        />
      )}

      {content.content_type === 'video' && (
        <div className="space-y-6">
          <VideoPlayer url={content.content_data.video_url || ''} />
          <Button onClick={handleVideoComplete} className="w-full">
            Mark as Complete
          </Button>
        </div>
      )}

      {(content.content_type === 'interactive' || 
        content.content_type === 'scenario' || 
        content.content_type === 'sandbox') && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)} content player coming soon!
            </p>
            <Button onClick={() => handleComplete(80)}>
              Complete Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
