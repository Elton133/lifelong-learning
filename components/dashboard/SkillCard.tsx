'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/Progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn, getMasteryLabel, getMasteryColor, getMasteryBadgeClass, formatRelativeTime } from '@/lib/utils';
import type { UserSkill } from '@/types/database';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ChevronRight, TrendingUp } from 'lucide-react';

interface SkillCardProps {
  userSkill: UserSkill;
  className?: string;
  index?: number;
}

export function SkillCard({ userSkill, className, index = 0 }: SkillCardProps) {
  const skill = userSkill.skill;
  
  if (!skill) return null;

  const categoryColors: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    communication: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    leadership: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'domain-specific': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card variant="outline" className={cn('hover:shadow-lg transition-all duration-300', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{skill.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {skill.category && (
                  <Badge size="sm" className={categoryColors[skill.category]}>
                    {skill.category}
                  </Badge>
                )}
                <Badge size="sm" className={getMasteryBadgeClass(userSkill.mastery_level)}>
                  {getMasteryLabel(userSkill.mastery_level)}
                </Badge>
              </div>
            </div>
            {userSkill.growth_velocity && userSkill.growth_velocity > 2 && (
              <motion.div 
                className="flex items-center gap-1 text-green-600 text-sm"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <TrendingUp className="w-4 h-4" />
                <span>+{userSkill.growth_velocity.toFixed(1)}</span>
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mastery</span>
              <span className="font-medium">{userSkill.mastery_level}%</span>
            </div>
            <Progress 
              value={userSkill.mastery_level} 
              size="md" 
              color={getMasteryColor(userSkill.mastery_level)}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Practiced {userSkill.practice_count} times</span>
              {userSkill.last_practiced && (
                <span>Last: {formatRelativeTime(userSkill.last_practiced)}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SkillsPreviewProps {
  skills: UserSkill[];
  className?: string;
}

export function SkillsPreview({ skills, className }: SkillsPreviewProps) {
  // Show top 3 skills by mastery level
  const topSkills = [...skills]
    .sort((a, b) => b.mastery_level - a.mastery_level)
    .slice(0, 3);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Skills</h2>
        <Link href="/skills">
          <Button variant="ghost" size="sm">
            View all
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="grid gap-3">
        {topSkills.map((skill, index) => (
          <SkillCard key={skill.id} userSkill={skill} index={index} />
        ))}
      </div>
    </div>
  );
}
