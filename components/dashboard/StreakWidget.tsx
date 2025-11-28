'use client';

import { Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StreakWidgetProps {
  count: number;
  className?: string;
}

export function StreakWidget({ count, className }: StreakWidgetProps) {
  const isActive = count > 0;
  
  return (
    <Card 
      className={cn(
        'flex items-center gap-4 bg-gradient-to-r shadow-sm',
        isActive 
          ? 'from-orange-500/10 to-red-500/10 border border-orange-200 dark:border-orange-800' 
          : 'from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-14 h-14 rounded-full',
        isActive 
          ? 'bg-gradient-to-br from-orange-400 to-red-500' 
          : 'bg-gray-300 dark:bg-zinc-700'
      )}>
        <Flame className={cn(
          'w-7 h-7',
          isActive ? 'text-white' : 'text-gray-500 dark:text-zinc-500'
        )} />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'text-3xl font-bold',
            isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500'
          )}>
            {count}
          </span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isActive 
            ? count >= 7 
              ? "You're on fire! 🔥" 
              : 'Keep it going!'
            : 'Start learning today!'}
        </p>
      </div>
    </Card>
  );
}
