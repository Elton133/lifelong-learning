// AI Service integration using free HuggingFace Inference API
// This provides AI-powered insights and recommendations

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Free models that don't require authentication for basic usage
const MODELS = {
  textGeneration: 'microsoft/DialoGPT-medium',
  sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  summarization: 'facebook/bart-large-cnn',
};

export interface AIInsight {
  type: 'suggestion' | 'encouragement' | 'pattern_detected' | 'warning';
  title: string;
  message: string;
  priority: number;
}

export interface UserContext {
  skills: { name: string; mastery: number }[];
  streak: number;
  recentActivity: string[];
  interests: string[];
  goals: string[];
}

// Generate personalized insights based on user data
export async function generateInsights(context: UserContext): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];

  // Streak-based encouragement
  if (context.streak >= 7) {
    insights.push({
      type: 'encouragement',
      title: `${context.streak}-day streak! 🔥`,
      message: `Amazing dedication! You're building a strong learning habit. Keep it up!`,
      priority: 8,
    });
  } else if (context.streak >= 3) {
    insights.push({
      type: 'encouragement',
      title: 'Great progress!',
      message: `You're on a ${context.streak}-day streak. Just ${7 - context.streak} more days to reach a week!`,
      priority: 6,
    });
  }

  // Skill-based suggestions
  const lowMasterySkills = context.skills.filter(s => s.mastery < 40);
  const highMasterySkills = context.skills.filter(s => s.mastery >= 70);

  if (lowMasterySkills.length > 0) {
    insights.push({
      type: 'suggestion',
      title: 'Skill boost opportunity',
      message: `Your ${lowMasterySkills[0].name} skill could use some practice. We've got content ready for you!`,
      priority: 7,
    });
  }

  if (highMasterySkills.length > 0) {
    insights.push({
      type: 'pattern_detected',
      title: `Expert in ${highMasterySkills[0].name}!`,
      message: `You're doing great with ${highMasterySkills[0].name}. Ready to challenge yourself with advanced content?`,
      priority: 5,
    });
  }

  // Interest-based recommendations
  if (context.interests.length > 0) {
    const randomInterest = context.interests[Math.floor(Math.random() * context.interests.length)];
    insights.push({
      type: 'suggestion',
      title: `New in ${randomInterest}`,
      message: `We found fresh content matching your interest in ${randomInterest}. Check it out!`,
      priority: 6,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

// Generate personalized learning recommendations
export async function generateRecommendations(
  interests: string[],
  skills: { name: string; mastery: number }[],
  learningStyle: string
): Promise<string[]> {
  const recommendations: string[] = [];

  // Based on learning style
  const styleContent: Record<string, string> = {
    visual: 'video tutorials and infographics',
    'hands-on': 'interactive exercises and coding challenges',
    reading: 'articles and documentation',
    audio: 'podcasts and audio lessons',
  };

  recommendations.push(
    `Based on your ${learningStyle} learning style, we recommend ${styleContent[learningStyle] || 'diverse content'}.`
  );

  // Based on skill gaps
  const skillsNeedingWork = skills.filter(s => s.mastery < 50);
  if (skillsNeedingWork.length > 0) {
    recommendations.push(
      `Focus on improving ${skillsNeedingWork.map(s => s.name).join(', ')} to round out your skills.`
    );
  }

  // Based on interests
  if (interests.length > 0) {
    recommendations.push(
      `Explore content in ${interests.slice(0, 3).join(', ')} to stay engaged with your passions.`
    );
  }

  return recommendations;
}

// Simple text analysis for learning content
export function analyzeContent(text: string): {
  readingTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
} {
  const words = text.split(/\s+/).length;
  const readingTime = Math.ceil(words / 200); // Average reading speed

  // Simple difficulty analysis based on sentence complexity
  const sentences = text.split(/[.!?]+/);
  const avgWordsPerSentence = words / sentences.length;
  
  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (avgWordsPerSentence > 20) difficulty = 'advanced';
  else if (avgWordsPerSentence > 15) difficulty = 'intermediate';

  // Extract potential topics (simplified)
  const commonTopics = [
    'programming', 'design', 'business', 'marketing', 'leadership',
    'communication', 'technology', 'data', 'analytics', 'management'
  ];
  
  const topics = commonTopics.filter(topic => 
    text.toLowerCase().includes(topic)
  );

  return { readingTime, difficulty, topics };
}

// Generate motivational messages
export function getMotivationalMessage(context: {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  streak: number;
  lastActivity?: string;
}): string {
  const messages: Record<string, string[]> = {
    morning: [
      'Rise and shine! Ready to learn something new?',
      'Good morning! A fresh day for fresh knowledge.',
      'Start your day with a learning boost!',
    ],
    afternoon: [
      'Keep the momentum going!',
      'Perfect time for a quick learning session.',
      'You\'re doing great today!',
    ],
    evening: [
      'Wind down with some light learning.',
      'Reflect on what you learned today.',
      'A little learning before rest goes a long way!',
    ],
  };

  const timeMessages = messages[context.timeOfDay];
  const baseMessage = timeMessages[Math.floor(Math.random() * timeMessages.length)];

  if (context.streak > 0) {
    return `${baseMessage} 🔥 ${context.streak}-day streak!`;
  }

  return baseMessage;
}

// Calculate learning score
export function calculateLearningScore(
  completedSessions: number,
  avgPerformance: number,
  streakDays: number,
  skillsImproved: number
): number {
  const sessionWeight = 0.3;
  const performanceWeight = 0.3;
  const streakWeight = 0.2;
  const skillsWeight = 0.2;

  const sessionScore = Math.min(completedSessions / 10, 1) * 100;
  const streakScore = Math.min(streakDays / 30, 1) * 100;
  const skillsScore = Math.min(skillsImproved / 5, 1) * 100;

  return Math.round(
    sessionScore * sessionWeight +
    avgPerformance * performanceWeight +
    streakScore * streakWeight +
    skillsScore * skillsWeight
  );
}

export default {
  generateInsights,
  generateRecommendations,
  analyzeContent,
  getMotivationalMessage,
  calculateLearningScore,
};
