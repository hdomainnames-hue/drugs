import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const sqlite3 = require("sqlite3").verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  const v = process.argv[idx + 1];
  if (!v || v.startsWith("--")) return null;
  return v;
}

function openSqlite(sqlitePath) {
  return new sqlite3.Database(sqlitePath);
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function importDrugs(prisma, sqliteDb, { batchSize = 500 } = {}) {
  const rows = await all(
    sqliteDb,
    `SELECT remote_id, name, price, company, active_ingredient, description, meta_description, image_source_url, image_local_path, url
     FROM drugs
     WHERE remote_id IS NOT NULL AND name IS NOT NULL AND TRIM(name) <> ''
     ORDER BY remote_id ASC`
  );

  console.log(`SQLite drugs rows: ${rows.length}`);

  let createdTotal = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const data = chunk.map((r) => ({
      remoteId: Number(r.remote_id),
      name: String(r.name),
      price: r.price != null ? String(r.price) : null,
      company: r.company != null ? String(r.company) : null,
      activeIngredient: r.active_ingredient != null ? String(r.active_ingredient) : null,
      description: r.description != null ? String(r.description) : null,
      metaDescription: r.meta_description != null ? String(r.meta_description) : null,
      imageSourceUrl: r.image_source_url != null ? String(r.image_source_url) : null,
      imageLocalPath: r.image_local_path != null ? String(r.image_local_path) : null,
      url: r.url != null ? String(r.url) : null,
    }));

    const res = await prisma.drug.createMany({
      data,
      skipDuplicates: true,
    });

    createdTotal += res.count;
    console.log(`Drugs imported: +${res.count} (total created ${createdTotal}) [${i + chunk.length}/${rows.length}]`);
  }

  const total = await prisma.drug.count();
  console.log(`Postgres drugs total: ${total}`);
}

async function importSimilar(prisma, sqliteDb, { batchSize = 2000 } = {}) {
  const edges = await all(
    sqliteDb,
    `SELECT drug_remote_id, similar_remote_id
     FROM drug_similar
     WHERE drug_remote_id IS NOT NULL AND similar_remote_id IS NOT NULL
     ORDER BY drug_remote_id ASC, similar_remote_id ASC`
  );

  console.log(`SQLite drug_similar edges: ${edges.length}`);

  const drugs = await prisma.drug.findMany({
    select: { id: true, remoteId: true },
  });

  const map = new Map(drugs.map((d) => [d.remoteId, d.id]));
  console.log(`RemoteId map size: ${map.size}`);

  let insertedTotal = 0;
  let skippedMissing = 0;

  const buffer = [];
  for (const e of edges) {
    const fromId = map.get(Number(e.drug_remote_id));
    const toId = map.get(Number(e.similar_remote_id));
    if (!fromId || !toId) {
      skippedMissing++;
      continue;
    }
    if (fromId === toId) continue;
    buffer.push({ fromDrugId: fromId, toDrugId: toId });
  }

  console.log(`Edges ready for insert: ${buffer.length} (skipped missing endpoints: ${skippedMissing})`);

  for (let i = 0; i < buffer.length; i += batchSize) {
    const chunk = buffer.slice(i, i + batchSize);
    const res = await prisma.drugSimilar.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    insertedTotal += res.count;
    console.log(`Similar edges imported: +${res.count} (total created ${insertedTotal}) [${i + chunk.length}/${buffer.length}]`);
  }

  const total = await prisma.drugSimilar.count();
  console.log(`Postgres drug_similar total: ${total}`);
}

async function main() {
  const sqlitePathArg = parseArg("--sqlite");
  const defaultSqlite = path.resolve(__dirname, "..", "..", "D", "drugs.db");
  const sqlitePath = sqlitePathArg ? path.resolve(sqlitePathArg) : defaultSqlite;

  console.log(`Using SQLite: ${sqlitePath}`);
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Create c:/web/drugs/.env manually or set env var before running.");
    process.exitCode = 1;
    return;
  }

  const sqliteDb = openSqlite(sqlitePath);
  sqliteDb.configure("busyTimeout", 60000);

  const prisma = new PrismaClient();

  try {
    console.log("Starting import... (drugs -> drug_similar)");
    await importDrugs(prisma, sqliteDb);
    await importSimilar(prisma, sqliteDb);
    console.log("Import finished.");
  } finally {
    await prisma.$disconnect();
    sqliteDb.close();
  }
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exitCode = 1;
});
