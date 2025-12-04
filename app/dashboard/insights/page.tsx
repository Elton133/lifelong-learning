'use client';

import { useInsights } from '@/hooks/useInsights';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { insights, loading, dismiss, markRead } = useInsights();

  if (loading) {
    return <LoadingSkeleton />;
  }

  const unreadInsights = insights.filter(i => !i.is_read);
  const readInsights = insights.filter(i => i.is_read);

  const handleMarkAllRead = () => {
    unreadInsights.forEach(i => markRead(i.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground mt-1">
            Personalized recommendations based on your learning patterns
          </p>
        </div>
        {unreadInsights.length > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Unread Insights */}
      {unreadInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">New Insights ({unreadInsights.length})</h2>
          </div>
          <div className="space-y-3">
            {unreadInsights.map(insight => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onDismiss={dismiss}
              />
            ))}
          </div>
        </div>
      )}

      {/* Read Insights */}
      {readInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BellOff className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-muted-foreground">Previous Insights</h2>
          </div>
          <div className="space-y-3">
            {readInsights.map(insight => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                onDismiss={dismiss}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No insights yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Keep learning and we&apos;ll provide personalized insights based on your progress.
          </p>
        </Card>
      )}
    </div>
  );
}
