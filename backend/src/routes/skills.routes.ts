import { Router } from 'express';

const router = Router();

// GET /api/skills
router.get('/', async (req, res) => {
  res.json([
    { id: 'skill-1', name: 'TypeScript', category: 'technical', description: 'Typed superset of JavaScript' },
    { id: 'skill-2', name: 'React', category: 'technical', description: 'JavaScript library for building UIs' },
    { id: 'skill-3', name: 'Node.js', category: 'technical', description: 'JavaScript runtime' },
    { id: 'skill-4', name: 'Next.js', category: 'technical', description: 'React framework' },
    { id: 'skill-5', name: 'PostgreSQL', category: 'technical', description: 'Relational database' },
    { id: 'skill-6', name: 'Technical Communication', category: 'communication', description: 'Communicate technical concepts' },
  ]);
});

// GET /api/skills/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  res.json({
    id,
    name: 'TypeScript',
    category: 'technical',
    description: 'Typed superset of JavaScript for building robust applications',
    related_skills: ['skill-2', 'skill-3'],
    created_at: new Date().toISOString(),
  });
});

export default router;
