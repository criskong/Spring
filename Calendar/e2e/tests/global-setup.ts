import { request, type FullConfig } from "@playwright/test";
import { ACCOUNT, deleteTestEvents } from "./helpers";

/**
 * Prima di ogni giro di test:
 * - in locale (database H2 vuoto) registra l'account di prova
 * - cancella eventuali eventi rimasti da un giro precedente
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;
  const api = await request.newContext({ baseURL });

  if (!process.env.E2E_BASE_URL) {
    // Se l'account esiste già il server risponde 409: va bene lo stesso
    await api.post("/api/auth/register", {
      data: { ...ACCOUNT, email: process.env.E2E_EMAIL ?? `${ACCOUNT.username}@example.com` }
    });
  }

  await deleteTestEvents(api);
  await api.dispose();
}
