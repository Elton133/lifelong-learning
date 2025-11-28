'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Welcome to Lifelong Learning! 🎉',
    description: 'This is your personalized dashboard. Let us show you around!',
    position: 'bottom',
  },
  {
    target: '[data-tour="streak"]',
    title: 'Keep Your Streak Going! 🔥',
    description: 'Your streak shows how many consecutive days you\'ve been learning. Build habits and earn rewards!',
    position: 'bottom',
  },
  {
    target: '[data-tour="stats"]',
    title: 'Track Your Progress 📊',
    description: 'See your XP, skills improving, and daily learning goals all in one place.',
    position: 'bottom',
  },
  {
    target: '[data-tour="playlist"]',
    title: 'Your Daily Learning Path 📚',
    description: 'We curate personalized content just for you based on your interests and goals.',
    position: 'right',
  },
  {
    target: '[data-tour="skills"]',
    title: 'Grow Your Skills 🚀',
    description: 'Track your skill mastery levels and see how you\'re improving over time.',
    position: 'left',
  },
  {
    target: '[data-tour="insights"]',
    title: 'AI-Powered Insights 💡',
    description: 'Get personalized suggestions and encouragement from our AI coach.',
    position: 'top',
  },
];

interface DashboardTourProps {
  onComplete: () => void;
}

export function DashboardTour({ onComplete }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    const updateTargetRect = () => {
      const target = document.querySelector(step.target);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
        // Scroll element into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [step.target, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('showTour', 'false');
    localStorage.setItem('tourCompleted', 'true');
    setTimeout(onComplete, 300);
  };

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (step.position) {
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)',
        };
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Spotlight on target */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-transparent rounded-xl"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              border: '2px solid var(--primary)',
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 z-10"
          style={getTooltipPosition()}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentStep
                    ? 'bg-primary w-4'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={isFirstStep ? 'invisible' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>

            <Button
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
