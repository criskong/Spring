import { expect, test } from "@playwright/test";
import { ACCOUNT, login } from "./helpers";

/** Accesso all'app: password sbagliata, login corretto e logout. */
test.describe("login e logout", () => {
  // In modalità lenta resta 3 secondi sul risultato prima di chiudere la pagina.
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === "lento") await page.waitForTimeout(3000);
  });

  test("con la password sbagliata mostra un errore", async ({ page }) => {
    await page.goto("/");
    await page.locator("#login-username").fill(ACCOUNT.username);
    await page.locator("#login-password").fill("password-sbagliata");
    await page.getByRole("button", { name: "Accedi", exact: true }).click();

    await expect(page.locator("#login-error")).toHaveText("Username o password non validi");
    await expect(page.locator("#app-screen")).toBeHidden();
  });

  test("con le credenziali giuste entra nel calendario", async ({ page }) => {
    await login(page);

    await expect(page.locator("#month-title")).not.toBeEmpty();
    await expect(page.locator(".day-cell.today")).toBeVisible();
  });

  test("dopo il logout torna alla schermata di login", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "⏻ Esci" }).click();

    await expect(page.locator("#auth-screen")).toBeVisible();
    // Ricaricando la pagina non deve rientrare da solo: il token è stato cancellato
    await page.reload();
    await expect(page.locator("#auth-screen")).toBeVisible();
  });
});
