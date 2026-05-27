import app from './app.js';
import { getDb } from './db.js';
import { migrate } from './migrate.js';

const PORT = process.env.PORT || 3001;

migrate(getDb());

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`MolBreeding server running on http://0.0.0.0:${PORT}`);
});
