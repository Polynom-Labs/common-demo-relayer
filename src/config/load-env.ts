import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config, parse } from "dotenv";

config();

const FILE_OWNED_KEYS = ["APPLICATION_ID", "KYT_API_BASE_URL"] as const;

function refreshStandKeysFromDotenvFile(): void {
  try {
    const parsed = parse(readFileSync(resolve(process.cwd(), ".env")));
    for (const key of FILE_OWNED_KEYS) {
      const value = parsed[key];
      if (value) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

refreshStandKeysFromDotenvFile();
