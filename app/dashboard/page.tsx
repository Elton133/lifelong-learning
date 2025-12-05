'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { PlaylistPreview } from '@/components/dashboard/PlaylistCard';
import { InsightsPreview } from '@/components/dashboard/InsightCard';
import { SkillsPreview } from '@/components/dashboard/SkillCard';
import { DashboardTour } from '@/components/dashboard/DashboardTour';
import { useUser, useDashboardStats, useSkills } from '@/hooks/useUser';
import { usePlaylist } from '@/hooks/usePlaylist';
import { useInsights } from '@/hooks/useInsights';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 bg-muted rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-muted rounded-xl" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useUser();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { skills, loading: skillsLoading } = useSkills();
  const { playlist, loading: playlistLoading } = usePlaylist();
  const { insights, dismiss } = useInsights();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if tour should be shown (first time user)
    const shouldShowTour = localStorage.getItem('showTour') === 'true';
    const tourCompleted = localStorage.getItem('tourCompleted') === 'true';
    
    if (shouldShowTour && !tourCompleted) {
      // Delay tour start to allow page to render
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const isLoading = profileLoading || statsLoading || skillsLoading || playlistLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      {showTour && <DashboardTour onComplete={handleTourComplete} />}
      
      <motion.div 
        className="space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Welcome & Streak */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center gap-4"
          variants={fadeInUp}
          data-tour="welcome"
        >
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Learner'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue your learning journey?
            </p>
          </div>
          <div data-tour="streak">
            <StreakWidget count={stats?.streak_count || 0} className="sm:w-auto" />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeInUp} data-tour="stats">
          {stats && profile && <StatsCards stats={stats} dailyGoal={profile.daily_learning_time || 30} />}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Playlist */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            variants={fadeInUp}
          >
            <div data-tour="playlist">
              {playlist?.contents && (
                <PlaylistPreview contents={playlist.contents} />
              )}
            </div>
            
            {/* Insights */}
            <div data-tour="insights">
              <InsightsPreview 
                insights={insights} 
                onDismiss={dismiss}
              />
            </div>
          </motion.div>

          {/* Right Column - Skills */}
          <motion.div variants={fadeInUp} data-tour="skills">
            <SkillsPreview skills={skills} />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
