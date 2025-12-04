'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, HelpCircle, Code, MessageSquare, MousePointer, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatDuration, getDifficultyColor } from '@/lib/utils';
import type { LearningContent } from '@/types/database';

interface PlaylistCardProps {
  content: LearningContent;
  index?: number;
  className?: string;
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  sandbox: <Code className="w-4 h-4" />,
  scenario: <MessageSquare className="w-4 h-4" />,
  interactive: <MousePointer className="w-4 h-4" />,
};

const contentTypeLabels: Record<string, string> = {
  video: 'Video',
  quiz: 'Quiz',
  sandbox: 'Sandbox',
  scenario: 'Scenario',
  interactive: 'Interactive',
};

export function PlaylistCard({ content, index, className }: PlaylistCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card 
        variant="outline" 
        className={cn(
          'group hover:border-primary/50 hover:shadow-lg transition-all duration-300',
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {index !== undefined && (
                <motion.span 
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 text-primary text-sm font-medium shrink-0"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {index + 1}
                </motion.span>
              )}
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {content.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {content.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="flex items-center gap-1">
                {contentTypeIcons[content.content_type]}
                {contentTypeLabels[content.content_type]}
              </Badge>
              <Badge className={getDifficultyColor(content.difficulty)}>
                {content.difficulty}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDuration(content.estimated_duration)}
              </span>
            </div>
            <Link href={`/dashboard/learn/${content.id}`}>
              <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-white transition-colors">
                Start
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface PlaylistPreviewProps {
  contents: LearningContent[];
  title?: string;
  className?: string;
}

export function PlaylistPreview({ contents, title = "Today's Learning Path", className }: PlaylistPreviewProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link href="/dashboard/playlist">
          <Button variant="ghost" size="sm">
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {contents.slice(0, 3).map((content, index) => (
          <PlaylistCard key={content.id} content={content} index={index} />
        ))}
      </div>
    </div>
  );
}
