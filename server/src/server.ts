import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool, ensureSchema } from "./config/database.js";

async function start() {
  if (pool) await ensureSchema();
  app.listen(env.port, () => { console.info(`Fitness Platform API listening on port ${env.port}`); });
}

void start().catch((error: unknown) => {
  console.error("Could not start the Fitness Platform API:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
