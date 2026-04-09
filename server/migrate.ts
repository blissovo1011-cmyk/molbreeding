import { getPool } from './db.js';

export async function migrate(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('自主研发', '定制开发')),
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Effective', 'Obsolete')),
      version TEXT,
      "nameEn" TEXT,
      "nameCn" TEXT,
      "projectCode" TEXT,
      "productType" TEXT NOT NULL,
      "productTech" TEXT NOT NULL CHECK("productTech" IN ('GenoBaits®', 'GenoPlexs®')),
      species TEXT NOT NULL,
      "clientUnit" TEXT,
      "clientName" TEXT,
      "alertValue" INTEGER NOT NULL CHECK("alertValue" > 0),
      "deliveryForm" TEXT,
      "finalReport" BOOLEAN NOT NULL DEFAULT false,
      "coverModule" TEXT,
      "dataStandardGb" TEXT,
      "dataLowerLimitGb" TEXT,
      "actualDataGb" TEXT,
      "segmentCount" TEXT,
      "coreSnpCount" TEXT,
      "mSnpCount" TEXT,
      "indelCount" TEXT,
      "targetRegionCount" TEXT,
      "segmentInnerType" TEXT,
      "refGenome" TEXT,
      "annotationInfo" TEXT,
      "refGenomeSpecies" TEXT,
      "refGenomeSizeGb" TEXT,
      "qcParam" TEXT,
      "qcStandard" TEXT,
      "applicationDirection" TEXT,
      catalog TEXT,
      "configDir" TEXT,
      "isLocusSecret" BOOLEAN NOT NULL DEFAULT false,
      "reagentQc" TEXT,
      "transferDate" TEXT,
      usage TEXT,
      "recommendCrossCycle" TEXT,
      "traitName" TEXT,
      "canUpgradeToNewVersion" BOOLEAN NOT NULL DEFAULT false,
      "minEffectiveDepth" TEXT,
      "transgenicEvent" TEXT,
      "transferInfo" TEXT,
      remark TEXT,
      "offlineReason" TEXT,
      "syncMainland" BOOLEAN NOT NULL DEFAULT false,
      "syncOverseas" BOOLEAN NOT NULL DEFAULT false,
      "mainlandAlertValue" INTEGER,
      "mainlandStatus" TEXT CHECK("mainlandStatus" IS NULL OR "mainlandStatus" IN ('Pending', 'Effective', 'Obsolete')),
      "overseasAlertValue" INTEGER,
      "overseasStatus" TEXT CHECK("overseasStatus" IS NULL OR "overseasStatus" IN ('Pending', 'Effective', 'Obsolete')),
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reagents (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      "productId" TEXT NOT NULL REFERENCES products(id),
      spec TEXT NOT NULL,
      "batchNo" TEXT,
      stock INTEGER,
      "expiryDate" TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Effective', 'Obsolete')),
      "syncMainland" BOOLEAN NOT NULL DEFAULT false,
      "syncOverseas" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_reagents_productid ON reagents("productId")`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reagent_warehouses (
      id TEXT PRIMARY KEY,
      "reagentId" TEXT NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
      warehouse TEXT NOT NULL,
      "itemNo" TEXT NOT NULL,
      "kingdeeCode" TEXT NOT NULL
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_reagent_warehouses_reagentid ON reagent_warehouses("reagentId")`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reagent_sync_configs (
      id TEXT PRIMARY KEY,
      "reagentId" TEXT NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
      system TEXT NOT NULL CHECK(system IN ('mainland', 'overseas')),
      "alertValue" INTEGER,
      warehouse TEXT,
      "kingdeeCode" TEXT,
      "localName" TEXT,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Effective', 'Obsolete')),
      UNIQUE("reagentId", system)
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_reagent_sync_configs_reagentid ON reagent_sync_configs("reagentId")`);
}
