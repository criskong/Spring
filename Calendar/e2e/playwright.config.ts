import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * Test end-to-end nel browser con l'account di prova.
 *
 * Di default avviano l'app Spring in locale con il database H2 in memoria
 * (profilo "e2e"): non serve MySQL e l'account di prova viene creato all'avvio.
 * Impostando E2E_BASE_URL in .env.local girano invece sull'app già online.
 *
 *   npm run test:e2e        veloce, per controllare che tutto funzioni
 *   npm run test:e2e:slow   lento (1 secondo tra un'azione e l'altra) con il browser
 *                           visibile: anche i video del report vengono lenti
 */

// Credenziali da .env.local (mai su GitHub).
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index <= 0 || line.trim().startsWith("#")) continue;
    const key = line.slice(0, index).trim();
    if (!(key in process.env)) process.env[key] = line.slice(index + 1).trim().replace(/^"|"$/g, "");
  }
}

const PORT = 8081;
// Cartella del progetto Spring (quella con pom.xml), un livello sopra e2e/
const SPRING_DIR = path.resolve(__dirname, "..");
const MAVEN = path.join(SPRING_DIR, process.platform === "win32" ? "mvnw.cmd" : "mvnw");
const REMOTE_URL = process.env.E2E_BASE_URL;
// Pausa tra un'azione e l'altra nel progetto "lento" (ms).
const SLOW_MO = 1000;

export default defineConfig({
  testDir: "./tests",
  // I test usano lo stesso account: uno alla volta, nell'ordine scritto.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Elenco nel terminale + report HTML con video e screenshot (npm run test:e2e:report).
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./tests/global-setup.ts",
  use: {
    baseURL: REMOTE_URL ?? `http://localhost:${PORT}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 1366, height: 800 },
    locale: "it-IT",
    timezoneId: "Europe/Rome",
    // Video e screenshot sempre: il report serve anche per controllare a occhio.
    trace: "on",
    video: "on",
    screenshot: "on"
  },
  projects: [
    { name: "veloce" },
    {
      name: "lento",
      timeout: 240_000,
      expect: { timeout: 20_000 },
      use: { launchOptions: { slowMo: SLOW_MO } }
    }
  ],
  // Se non c'è un URL remoto avvia l'app in locale (profilo e2e = database H2 in memoria)
  webServer: REMOTE_URL
    ? undefined
    : {
        // useTestClasspath porta H2 (dipendenza di test), additional-location fa leggere
        // application-e2e.properties da src/test/resources
        command: `"${MAVEN}" -q spring-boot:run -Dspring-boot.run.profiles=e2e -Dspring-boot.run.useTestClasspath=true "-Dspring-boot.run.arguments=--spring.config.additional-location=file:src/test/resources/"`,
        cwd: SPRING_DIR,
        url: `http://localhost:${PORT}/index.html`,
        env: { PORT: String(PORT) },
        reuseExistingServer: true,
        timeout: 180_000
      }
});
