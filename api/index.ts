import { getDb } from '../server/db.js';
import { migrate } from '../server/migrate.js';
import app from '../server/app.js';

// Ensure DB is migrated on cold start
migrate(getDb());

export default app;
