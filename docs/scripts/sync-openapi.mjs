import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(docsDir, "../..");
const source = resolve(rootDir, "backend/docs/swagger.yaml");
const target = resolve(rootDir, "docs/public/openapi.yaml");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log(`Synced OpenAPI spec: ${source} -> ${target}`);
