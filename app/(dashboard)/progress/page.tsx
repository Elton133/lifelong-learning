'use client';

import { useDashboardStats, useSkills } from '@/hooks/useUser';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { getMasteryLabel, getMasteryColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-xl" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { skills, loading: skillsLoading } = useSkills();

  const loading = statsLoading || skillsLoading;

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Prepare skill data for chart
  const skillChartData = skills
    .sort((a, b) => b.mastery_level - a.mastery_level)
    .map(s => ({
      name: s.skill?.name || 'Unknown',
      mastery: s.mastery_level,
      practice: s.practice_count,
    }));

  // Calculate weekly totals
  const weeklyTotals = stats?.weekly_progress?.reduce(
    (acc, day) => ({
      xp: acc.xp + day.xp_earned,
      sessions: acc.sessions + day.sessions_completed,
    }),
    { xp: 0, sessions: 0 }
  ) || { xp: 0, sessions: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Progress & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning journey and skill development
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly XP</p>
                <p className="text-2xl font-bold">{weeklyTotals.xp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions This Week</p>
                <p className="text-2xl font-bold">{weeklyTotals.sessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(weeklyTotals.sessions * 5 / 7)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats?.streak_count || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weekly_progress || []}>
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="xp_earned" fill="var(--primary)" radius={[4, 4, 0, 0]} name="XP Earned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.weekly_progress || []}>
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions_completed" 
                    stroke="var(--secondary)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--secondary)', strokeWidth: 0 }}
                    name="Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Mastery */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Mastery Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillChartData.map((skill, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 shrink-0">
                  <p className="text-sm font-medium truncate">{skill.name}</p>
                </div>
                <div className="flex-1">
                  <Progress 
                    value={skill.mastery} 
                    color={getMasteryColor(skill.mastery)}
                  />
                </div>
                <div className="w-20 shrink-0 text-right">
                  <Badge size="sm" className={getMasteryColor(skill.mastery).replace('bg-', 'bg-opacity-20 text-').replace('-400', '-600')}>
                    {getMasteryLabel(skill.mastery)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
