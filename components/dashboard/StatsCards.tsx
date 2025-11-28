'use client';

import { Trophy, TrendingUp, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types/database';

interface StatsCardsProps {
  stats: DashboardStats;
  className?: string;
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  const dailyGoal = 30; // 30 minutes daily goal
  const dailyProgress = Math.min((stats.time_invested_today / dailyGoal) * 100, 100);

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {/* XP Card */}
      <Card variant="elevated" className="relative overflow-hidden">
        <CardContent className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total XP</p>
            <p className="text-2xl font-bold">{stats.total_xp.toLocaleString()}</p>
          </div>
        </CardContent>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full" />
      </Card>

      {/* Skills Improving */}
      <Card variant="elevated" className="relative overflow-hidden">
        <CardContent className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Skills Growing</p>
            <p className="text-2xl font-bold">{stats.skills_improving}</p>
          </div>
        </CardContent>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-green-500/5 rounded-full" />
      </Card>

      {/* Daily Goal Progress */}
      <Card variant="elevated" className="relative overflow-hidden">
        <CardContent className="flex items-center gap-3">
          <CircularProgress 
            value={dailyProgress} 
            size={48} 
            strokeWidth={5}
            color="stroke-secondary"
          >
            <Clock className="w-4 h-4 text-secondary" />
          </CircularProgress>
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-bold">{stats.time_invested_today}m</p>
            <p className="text-xs text-muted-foreground">of {dailyGoal}m goal</p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Hint */}
      <Card variant="elevated" className="relative overflow-hidden">
        <CardContent className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Achievements</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </CardContent>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-yellow-500/5 rounded-full" />
      </Card>
    </div>
  );
}
