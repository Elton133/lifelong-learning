'use client';

import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { PlaylistPreview } from '@/components/dashboard/PlaylistCard';
import { InsightsPreview } from '@/components/dashboard/InsightCard';
import { SkillsPreview } from '@/components/dashboard/SkillCard';
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

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useUser();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { skills, loading: skillsLoading } = useSkills();
  const { playlist, loading: playlistLoading } = usePlaylist();
  const { insights, dismiss } = useInsights();

  const isLoading = profileLoading || statsLoading || skillsLoading || playlistLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to continue your learning journey?
          </p>
        </div>
        <StreakWidget count={stats?.streak_count || 0} className="sm:w-auto" />
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Playlist */}
        <div className="lg:col-span-2 space-y-6">
          {playlist?.contents && (
            <PlaylistPreview contents={playlist.contents} />
          )}
          
          {/* Insights */}
          <InsightsPreview 
            insights={insights} 
            onDismiss={dismiss}
          />
        </div>

        {/* Right Column - Skills */}
        <div>
          <SkillsPreview skills={skills} />
        </div>
      </div>
    </div>
  );
}
