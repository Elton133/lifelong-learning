'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  User, 
  Target, 
  Clock, 
  Sparkles,
  Heart,
  Briefcase,
  Check,
  Palette,
  Cpu,
  Music,
  Camera,
  BookOpen,
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import type { Profile, CareerGoal } from '@/types/database';

// Interest categories with icons (same as onboarding)
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

// Learning goals (same as onboarding)
const LEARNING_GOALS = [
  { id: 'career', name: 'Advance my career', description: 'Gain skills for professional growth' },
  { id: 'hobby', name: 'Explore hobbies', description: 'Learn something new for fun' },
  { id: 'switch', name: 'Career switch', description: 'Build skills for a new path' },
  { id: 'stay-updated', name: 'Stay updated', description: 'Keep up with trends' },
  { id: 'side-project', name: 'Side projects', description: 'Build something on my own' },
  { id: 'personal-growth', name: 'Personal growth', description: 'Become a better version of myself' },
];

const LEARNING_STYLES = [
  { id: 'visual', name: 'Visual', description: 'Videos, diagrams, and infographics', icon: '🎬' },
  { id: 'hands-on', name: 'Hands-on', description: 'Interactive exercises and projects', icon: '🛠️' },
  { id: 'reading', name: 'Reading', description: 'Articles, books, and documentation', icon: '📚' },
  { id: 'audio', name: 'Audio', description: 'Podcasts and audio courses', icon: '🎧' },
];

const TIME_COMMITMENTS = [
  { id: 5, name: '5 minutes', description: 'Quick daily learning' },
  { id: 15, name: '15 minutes', description: 'A focused session' },
  { id: 30, name: '30 minutes', description: 'Deep learning time' },
  { id: 60, name: '1 hour+', description: 'Intensive learning' },
];

export default function SettingsPage() {
  const { profile, updateProfile, refetch } = useUser();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    full_name: string;
    role: string;
    department: string;
    interests: string[];
    career_goals: string[];
    learning_style: 'visual' | 'hands-on' | 'reading' | 'video' | 'audio' | '';
    daily_learning_time: number;
  }>({
    full_name: '',
    role: '',
    department: '',
    interests: [],
    career_goals: [],
    learning_style: '',
    daily_learning_time: 30,
  });

  useEffect(() => {
    if (profile) {
      // Extract goal IDs from career_goals objects with better mapping
      const goalIds = (profile.career_goals || []).map(goal => {
        // Try to match the goal title to a known goal ID
        const matchingGoal = LEARNING_GOALS.find(g => 
          g.name.toLowerCase() === goal.title.toLowerCase()
        );
        // If we find a match, use its ID, otherwise keep the original title
        if (matchingGoal) {
          return matchingGoal.id;
        }
        // Fallback: try to reverse engineer from common patterns
        const titleLower = goal.title.toLowerCase();
        if (titleLower.includes('career') && !titleLower.includes('switch')) return 'career';
        if (titleLower.includes('hobby') || titleLower.includes('explore')) return 'hobby';
        if (titleLower.includes('switch')) return 'switch';
        if (titleLower.includes('updated') || titleLower.includes('stay')) return 'stay-updated';
        if (titleLower.includes('side') || titleLower.includes('project')) return 'side-project';
        if (titleLower.includes('personal') || titleLower.includes('growth')) return 'personal-growth';
        // Last resort: convert to ID format
        return goal.title.toLowerCase().replace(/\s+/g, '-');
      });
      
      setFormData({
        full_name: profile.full_name || '',
        role: profile.role || '',
        department: profile.department || '',
        interests: profile.interests || [],
        career_goals: goalIds,
        learning_style: profile.learning_style || '',
        daily_learning_time: profile.daily_learning_time || 30,
      });
    }
  }, [profile]);

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id) 
        ? prev.interests.filter(i => i !== id) 
        : [...prev.interests, id]
    }));
  };

  const toggleGoal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      career_goals: prev.career_goals.includes(id) 
        ? prev.career_goals.filter(g => g !== id) 
        : [...prev.career_goals, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert career_goals IDs to CareerGoal objects
      const careerGoals: CareerGoal[] = formData.career_goals.map(goalId => {
        const goal = LEARNING_GOALS.find(g => g.id === goalId);
        return {
          title: goal?.name || goalId,
        };
      });

      const updates: Partial<Profile> = {
        full_name: formData.full_name,
        role: formData.role,
        department: formData.department,
        interests: formData.interests,
        career_goals: careerGoals,
        daily_learning_time: formData.daily_learning_time,
      };
      
      if (formData.learning_style) {
        updates.learning_style = formData.learning_style as 'visual' | 'hands-on' | 'reading' | 'video' | 'audio';
      }
      
      console.log('Updating profile with:', updates);
      const result = await updateProfile(updates);
      
      if (result) {
        // Force a refetch to ensure UI is in sync
        await refetch();
        success('Settings Updated', 'Your preferences have been saved successfully.');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      showError('Error', 'Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and learning preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Your name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your role"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your department"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Interests</CardTitle>
                <CardDescription>Select topics you&apos;d like to explore</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {INTERESTS.map((interest) => {
                const Icon = interest.icon;
                const isSelected = formData.interests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all duration-200',
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
                    <span className="text-sm font-medium block text-center">{interest.name}</span>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Career Goals */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Career Goals</CardTitle>
                <CardDescription>What are your learning goals?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {LEARNING_GOALS.map((goal) => {
                const isSelected = formData.career_goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
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
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>Customize your learning experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Learning Style</label>
              <div className="grid grid-cols-2 gap-3">
                {LEARNING_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, learning_style: style.id as typeof prev.learning_style }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.learning_style === style.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{style.name}</h3>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Learning Time */}
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Daily Learning Goal</CardTitle>
                <CardDescription>Set your daily learning time commitment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {TIME_COMMITMENTS.map(time => (
                <button
                  key={time.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, daily_learning_time: time.id }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.daily_learning_time === time.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <h3 className="text-lg font-bold mb-1">{time.name}</h3>
                  <p className="text-xs text-muted-foreground">{time.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[150px]"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
