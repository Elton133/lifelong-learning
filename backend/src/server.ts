import app from './app';
import dotenv from 'dotenv';
import { initializeScheduler } from './utils/scheduler';

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API base: http://localhost:${PORT}/api`);
  
  // Initialize background job scheduler
  initializeScheduler();
});
