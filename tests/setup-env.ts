// Loads .env.local into process.env so server modules behave in tests the same
// way they do at runtime. Existing process.env values always win.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import "@testing-library/jest-dom/vitest";

const envPath = path.resolve(process.cwd(), ".env.local");

if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// jsdom does not implement scrollIntoView, which AiChat calls when messages
// change. Provide a no-op in DOM test environments only.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
