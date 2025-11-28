'use client';

import { motion } from 'framer-motion';
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

  const cards = [
    {
      icon: Zap,
      label: 'Total XP',
      value: stats.total_xp.toLocaleString(),
      color: 'primary',
      bgGradient: 'from-primary/10 to-secondary/10',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: TrendingUp,
      label: 'Skills Growing',
      value: stats.skills_improving.toString(),
      color: 'success',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
    },
    {
      icon: Clock,
      label: 'Today',
      value: `${stats.time_invested_today}m`,
      subValue: `of ${dailyGoal}m goal`,
      color: 'secondary',
      bgGradient: 'from-secondary/10 to-blue-500/10',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
      showProgress: true,
      progress: dailyProgress,
    },
    {
      icon: Trophy,
      label: 'Achievements',
      value: '3',
      color: 'warning',
      bgGradient: 'from-yellow-500/10 to-amber-500/10',
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="elevated" className="hover-lift">
            <CardContent className="flex items-center gap-3">
              {card.showProgress ? (
                <CircularProgress 
                  value={card.progress || 0} 
                  size={48} 
                  strokeWidth={5}
                  color="stroke-secondary"
                >
                  <card.icon className={cn('w-4 h-4', card.iconColor)} />
                </CircularProgress>
              ) : (
                <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl', card.iconBg)}>
                  <card.icon className={cn('w-5 h-5', card.iconColor)} />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.subValue && (
                  <p className="text-xs text-muted-foreground">{card.subValue}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
