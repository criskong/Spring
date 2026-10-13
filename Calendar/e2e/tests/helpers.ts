import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Account di prova, preso da .env.local. */
export const ACCOUNT = {
  username: process.env.E2E_USERNAME ?? "",
  password: process.env.E2E_PASSWORD ?? ""
};

/** Tutti gli eventi creati dai test iniziano così, per riconoscerli e cancellarli. */
export const TEST_PREFIX = "E2E";

/** Login dalla schermata iniziale, come farebbe un utente. */
export async function login(page: Page) {
  if (!ACCOUNT.username || !ACCOUNT.password) throw new Error("Credenziali di prova mancanti: compila e2e/.env.local");
  await page.goto("/");
  await page.locator("#login-username").fill(ACCOUNT.username);
  await page.locator("#login-password").fill(ACCOUNT.password);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(page.locator("#app-screen")).toBeVisible();
}

/** Login tramite API: restituisce il token JWT per chiamare le altre API. */
export async function apiLogin(request: APIRequestContext) {
  const response = await request.post("/api/auth/login", { data: ACCOUNT });
  expect(response.ok(), "login API con l'account di prova").toBeTruthy();
  const body = await response.json();
  return body.token as string;
}

/** Cancella gli eventi lasciati dai test (quelli che iniziano con TEST_PREFIX). */
export async function deleteTestEvents(request: APIRequestContext) {
  const token = await apiLogin(request);
  const headers = { Authorization: `Bearer ${token}` };

  const events = await (await request.get("/api/events", { headers })).json();
  for (const event of events) {
    if (event.title.startsWith(TEST_PREFIX)) {
      await request.delete(`/api/events/${event.id}`, { headers });
    }
  }
}
