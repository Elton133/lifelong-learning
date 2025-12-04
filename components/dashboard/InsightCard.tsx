'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, TrendingUp, Award, AlertTriangle, X, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Insight } from '@/types/database';

interface InsightCardProps {
  insight: Insight;
  onDismiss?: (id: string) => void;
  className?: string;
  index?: number;
}

const insightIcons: Record<string, React.ReactNode> = {
  suggestion: <Lightbulb className="w-5 h-5 text-blue-500" />,
  pattern_detected: <TrendingUp className="w-5 h-5 text-purple-500" />,
  encouragement: <Award className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
};

const insightColors: Record<string, string> = {
  suggestion: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
  pattern_detected: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
  encouragement: 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20',
  warning: 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20',
};

export function InsightCard({ insight, onDismiss, className, index = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <Card
        className={cn(
          'border-l-4 relative hover:shadow-lg transition-shadow duration-300',
          insightColors[insight.insight_type],
          insight.is_read && 'opacity-70',
          className
        )}
      >
        <CardContent className="flex items-start gap-3 pt-4">
          <motion.div 
            className="shrink-0 mt-0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
          >
            {insightIcons[insight.insight_type]}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
            {insight.action_content && (
              <Link href={`/learn/${insight.action_content_id}`}>
                <Button variant="ghost" size="sm" className="mt-2 -ml-2 h-8">
                  Start learning
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
          {onDismiss && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDismiss(insight.id)}
              className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Dismiss insight"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface InsightsPreviewProps {
  insights: Insight[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export function InsightsPreview({ insights, onDismiss, className }: InsightsPreviewProps) {
  const unreadInsights = insights.filter(i => !i.is_read).slice(0, 2);

  if (unreadInsights.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <Link href="/dashboard/insights">
          <Button variant="ghost" size="sm">
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {unreadInsights.map((insight, index) => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onDismiss={onDismiss} 
              index={index}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
