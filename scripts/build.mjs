import { execSync } from "node:child_process";

function run(cmd, envExtra = {}) {
  execSync(cmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...envExtra,
    },
  });
}

const hasDbUrl = Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim());

// prisma generate requires DATABASE_URL to be defined in schema env(),
// but it does NOT require a working connection. Provide a dummy URL locally if missing.
const dummyDbUrl = "postgresql://user:pass@localhost:5432/db?schema=public";
const dbEnv = { DATABASE_URL: hasDbUrl ? process.env.DATABASE_URL : dummyDbUrl };

// Apply migrations only when a real database URL is present.
if (hasDbUrl) {
  try {
    run("npx prisma migrate deploy", dbEnv);
  } catch (e) {
    console.warn("Warning: prisma migrate deploy failed; continuing build.", e?.message ?? e);
  }
}

run("npx prisma generate", dbEnv);
run("next build");
