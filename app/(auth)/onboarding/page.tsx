'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Sparkles,
  Palette,
  Cpu,
  Music,
  Camera,
  BookOpen,
  Briefcase,
  Heart,
  Globe,
  Dumbbell,
  ChefHat,
  Code,
  TrendingUp,
  Users,
  MessageCircle,
  Brain,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Interest categories with icons
const INTERESTS = [
  { id: 'technology', name: 'Technology', icon: Cpu, color: 'from-blue-500 to-cyan-500' },
  { id: 'fashion', name: 'Fashion', icon: Palette, color: 'from-pink-500 to-rose-500' },
  { id: 'music', name: 'Music', icon: Music, color: 'from-purple-500 to-indigo-500' },
  { id: 'photography', name: 'Photography', icon: Camera, color: 'from-amber-500 to-orange-500' },
  { id: 'reading', name: 'Reading', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
  { id: 'business', name: 'Business', icon: Briefcase, color: 'from-slate-500 to-zinc-600' },
  { id: 'health', name: 'Health & Wellness', icon: Heart, color: 'from-red-500 to-pink-500' },
  { id: 'travel', name: 'Travel', icon: Globe, color: 'from-sky-500 to-blue-500' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
  { id: 'cooking', name: 'Cooking', icon: ChefHat, color: 'from-orange-500 to-amber-500' },
  { id: 'programming', name: 'Programming', icon: Code, color: 'from-violet-500 to-purple-500' },
  { id: 'finance', name: 'Finance', icon: TrendingUp, color: 'from-lime-500 to-green-500' },
  { id: 'leadership', name: 'Leadership', icon: Users, color: 'from-indigo-500 to-blue-500' },
  { id: 'communication', name: 'Communication', icon: MessageCircle, color: 'from-teal-500 to-cyan-500' },
  { id: 'creativity', name: 'Creativity', icon: Brain, color: 'from-fuchsia-500 to-pink-500' },
  { id: 'innovation', name: 'Innovation', icon: Lightbulb, color: 'from-yellow-500 to-amber-500' },
];

// Learning goals
const LEARNING_GOALS = [
  { id: 'career', name: 'Advance my career', description: 'Gain skills for professional growth' },
  { id: 'hobby', name: 'Explore hobbies', description: 'Learn something new for fun' },
  { id: 'switch', name: 'Career switch', description: 'Build skills for a new path' },
  { id: 'stay-updated', name: 'Stay updated', description: 'Keep up with trends' },
  { id: 'side-project', name: 'Side projects', description: 'Build something on my own' },
  { id: 'personal-growth', name: 'Personal growth', description: 'Become a better version of myself' },
];

// Learning styles
const LEARNING_STYLES = [
  { id: 'visual', name: 'Visual', description: 'Videos, diagrams, and infographics', icon: '🎬' },
  { id: 'hands-on', name: 'Hands-on', description: 'Interactive exercises and projects', icon: '🛠️' },
  { id: 'reading', name: 'Reading', description: 'Articles, books, and documentation', icon: '📚' },
  { id: 'audio', name: 'Audio', description: 'Podcasts and audio courses', icon: '🎧' },
];

// Time commitment options
const TIME_COMMITMENTS = [
  { id: '5', name: '5 minutes', description: 'Quick daily learning' },
  { id: '15', name: '15 minutes', description: 'A focused session' },
  { id: '30', name: '30 minutes', description: 'Deep learning time' },
  { id: '60', name: '1 hour+', description: 'Intensive learning' },
];

type OnboardingStep = 'interests' | 'goals' | 'style' | 'time' | 'complete';

const STEPS: OnboardingStep[] = ['interests', 'goals', 'style', 'time', 'complete'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('interests');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'interests': return selectedInterests.length >= 3;
      case 'goals': return selectedGoals.length >= 1;
      case 'style': return selectedStyle !== '';
      case 'time': return selectedTime !== '';
      default: return true;
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Save onboarding data to database
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Convert selectedGoals array to career_goals format
        const careerGoals = selectedGoals.map(goalId => {
          const goal = LEARNING_GOALS.find(g => g.id === goalId);
          return {
            title: goal?.name || goalId,
            target_date: undefined,
            skill_ids: undefined,
          };
        });

        // Update profile with onboarding data
        const { error } = await supabase
          .from('profiles')
          .update({
            interests: selectedInterests,
            career_goals: careerGoals,
            learning_style: selectedStyle as 'visual' | 'hands-on' | 'reading' | 'audio',
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving onboarding data:', error);
        }
      }

      // Save onboarding data to localStorage for tour trigger and preferences
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('showTour', 'true');
      localStorage.setItem('userPreferences', JSON.stringify({
        interests: selectedInterests,
        goals: selectedGoals,
        learningStyle: selectedStyle,
        dailyTime: selectedTime,
      }));

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 flex flex-col">
      {/* Progress bar */}
      <div className="max-w-3xl mx-auto w-full mb-8 pt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            {/* Step 1: Interests */}
            {currentStep === 'interests' && (
              <motion.div
                key="interests"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">What interests you?</h1>
                  <p className="text-muted-foreground">
                    Select at least 3 topics you&apos;d like to explore. Choose as many as you want!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {INTERESTS.map((interest, index) => {
                    const Icon = interest.icon;
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <motion.button
                        key={interest.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          'relative p-4 rounded-xl border-2 transition-all duration-200 group',
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-lg scale-105' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br flex items-center justify-center',
                          interest.color
                        )}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{interest.name}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  {selectedInterests.length} selected {selectedInterests.length < 3 && `(${3 - selectedInterests.length} more needed)`}
                </p>
              </motion.div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 'goals' && (
              <motion.div
                key="goals"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center"
                  >
                    <TrendingUp className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">What are your goals?</h1>
                  <p className="text-muted-foreground">
                    Select one or more learning goals that match your aspirations.
                  </p>
                </div>

                <div className="grid gap-3 max-w-xl mx-auto">
                  {LEARNING_GOALS.map((goal, index) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <motion.button
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          'relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4',
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-lg' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'bg-primary' : 'bg-muted'
                        )}>
                          {isSelected ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Learning Style */}
            {currentStep === 'style' && (
              <motion.div
                key="style"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center"
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">How do you learn best?</h1>
                  <p className="text-muted-foreground">
                    We&apos;ll personalize content based on your preferred learning style.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  {LEARNING_STYLES.map((style, index) => {
                    const isSelected = selectedStyle === style.id;
                    return (
                      <motion.button
                        key={style.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedStyle(style.id)}
                        className={cn(
                          'relative p-6 rounded-xl border-2 text-center transition-all duration-200',
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-lg scale-105' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        )}
                      >
                        <div className="text-4xl mb-3">{style.icon}</div>
                        <h3 className="font-semibold mb-1">{style.name}</h3>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Time Commitment */}
            {currentStep === 'time' && (
              <motion.div
                key="time"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-success to-primary flex items-center justify-center text-3xl"
                  >
                    ⏰
                  </motion.div>
                  <h1 className="text-3xl font-bold mb-2">Daily learning time?</h1>
                  <p className="text-muted-foreground">
                    How much time can you dedicate to learning each day?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  {TIME_COMMITMENTS.map((time, index) => {
                    const isSelected = selectedTime === time.id;
                    return (
                      <motion.button
                        key={time.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTime(time.id)}
                        className={cn(
                          'relative p-6 rounded-xl border-2 text-center transition-all duration-200',
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-lg scale-105' 
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        )}
                      >
                        <h3 className="text-2xl font-bold mb-1">{time.name}</h3>
                        <p className="text-sm text-muted-foreground">{time.description}</p>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 'complete' && (
              <motion.div
                key="complete"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold mb-2">You&apos;re all set!</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We&apos;ve personalized your learning experience based on your preferences. 
                  Ready to start your journey?
                </p>

                <Card className="max-w-md mx-auto p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <h3 className="font-semibold mb-4">Your Learning Profile</h3>
                  <div className="space-y-3 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interests:</span>
                      <span className="font-medium">{selectedInterests.length} topics</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goals:</span>
                      <span className="font-medium">{selectedGoals.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Learning style:</span>
                      <span className="font-medium capitalize">{selectedStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily time:</span>
                      <span className="font-medium">{TIME_COMMITMENTS.find(t => t.id === selectedTime)?.name}</span>
                    </div>
                  </div>
                </Card>

                <Button 
                  size="lg" 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="mt-6"
                >
                  {isSubmitting ? 'Setting up...' : 'Start Learning'}
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      {currentStep !== 'complete' && (
        <div className="max-w-3xl mx-auto w-full flex justify-between mt-8 pb-8">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={currentStepIndex === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
