'use client';

import { useState } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import { useSkills } from '@/hooks/useUser';
import { SkillCard } from '@/components/dashboard/SkillCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, getMasteryLabel, getMasteryColor } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'technical' | 'communication' | 'leadership' | 'domain-specific';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const { skills, loading } = useSkills();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');

  if (loading) {
    return <LoadingSkeleton />;
  }

  const filteredSkills = filterCategory === 'all' 
    ? skills 
    : skills.filter(s => s.skill?.category === filterCategory);

  const categories: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Skills' },
    { value: 'technical', label: 'Technical' },
    { value: 'communication', label: 'Communication' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'domain-specific', label: 'Domain' },
  ];

  // Calculate overall stats
  const avgMastery = skills.length > 0 
    ? Math.round(skills.reduce((acc, s) => acc + s.mastery_level, 0) / skills.length)
    : 0;
  const totalPractice = skills.reduce((acc, s) => acc + s.practice_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Your Skills</h1>
        <p className="text-muted-foreground mt-1">
          Track your skill development and mastery progress
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Skills</p>
            <p className="text-3xl font-bold mt-1">{skills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Mastery</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-3xl font-bold">{avgMastery}%</p>
              <Badge className={getMasteryColor(avgMastery).replace('bg-', 'bg-opacity-20 text-').replace('-400', '-600')}>
                {getMasteryLabel(avgMastery)}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Practice Sessions</p>
            <p className="text-3xl font-bold mt-1">{totalPractice}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={filterCategory === cat.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat.value)}
              className="shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'hover:bg-white/50'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'hover:bg-white/50'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Skills Grid/List */}
      {filteredSkills.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No skills found in this category.</p>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => (
            <SkillCard key={skill.id} userSkill={skill} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSkills.map(skill => (
            <Card key={skill.id} variant="outline" className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{skill.skill?.name}</h3>
                    <Badge size="sm" className={getMasteryColor(skill.mastery_level).replace('bg-', 'bg-opacity-20 text-').replace('-400', '-600')}>
                      {getMasteryLabel(skill.mastery_level)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Practiced {skill.practice_count} times
                  </p>
                </div>
                <div className="w-32 shrink-0">
                  <Progress value={skill.mastery_level} showLabel />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
