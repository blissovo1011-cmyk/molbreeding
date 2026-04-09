import app from './app.js';
import { migrate } from './migrate.js';

const PORT = process.env.PORT || 3001;

async function start() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`MolBreeding server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
