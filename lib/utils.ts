import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function calculateXP(baseXP: number, performanceScore: number): number {
  // Performance bonus: up to 50% extra XP for perfect score
  const bonus = (performanceScore / 100) * 0.5;
  return Math.round(baseXP * (1 + bonus));
}

export function getMasteryLabel(level: number): string {
  if (level < 20) return 'Novice';
  if (level < 40) return 'Beginner';
  if (level < 60) return 'Intermediate';
  if (level < 80) return 'Advanced';
  return 'Expert';
}

export function getMasteryColor(level: number): string {
  if (level < 20) return 'bg-gray-400';
  if (level < 40) return 'bg-blue-400';
  if (level < 60) return 'bg-purple-400';
  if (level < 80) return 'bg-orange-400';
  return 'bg-green-400';
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-600 bg-green-100';
    case 'intermediate':
      return 'text-yellow-600 bg-yellow-100';
    case 'advanced':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getContentTypeIcon(type: string): string {
  switch (type) {
    case 'video':
      return 'Play';
    case 'interactive':
      return 'MousePointer';
    case 'scenario':
      return 'MessageSquare';
    case 'sandbox':
      return 'Code';
    case 'quiz':
      return 'HelpCircle';
    default:
      return 'BookOpen';
  }
}
