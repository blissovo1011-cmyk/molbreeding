import app from './app.js';
import { getDb } from './db.js';
import { migrate } from './migrate.js';

const PORT = process.env.PORT || 3001;

// Initialize database and run migrations
const db = getDb();
migrate(db);

app.listen(PORT, () => {
  console.log(`MolBreeding server running on http://localhost:${PORT}`);
});
