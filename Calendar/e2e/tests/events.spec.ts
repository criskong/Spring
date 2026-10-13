import { expect, test } from "@playwright/test";
import { deleteTestEvents, login, TEST_PREFIX } from "./helpers";

/**
 * Ciclo di vita di un evento: creazione, viste mese/settimana/giorno,
 * lista con filtri, modifica ed eliminazione.
 * I test vanno in ordine (serial) perché lavorano sullo stesso evento.
 */
test.describe.serial("gestione eventi", () => {
  const title = `${TEST_PREFIX} Dentista`;
  const newTitle = `${TEST_PREFIX} Dentista spostato`;

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // In modalità lenta resta 3 secondi sul risultato prima di chiudere la pagina.
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.project.name === "lento") await page.waitForTimeout(3000);
  });

  // Anche se un test fallisce a metà, non lascia eventi di prova nel calendario
  test.afterAll(async ({ request }) => {
    await deleteTestEvents(request);
  });

  test("crea un evento per oggi dalla vista giorno", async ({ page }) => {
    // La vista giorno parte da oggi: il modal è già impostato su oggi 09:00 - 10:00
    await page.getByRole("button", { name: "Giorno", exact: true }).click();
    await page.locator("#time-view").getByRole("button", { name: "+ Nuovo evento" }).click();
    await expect(page.locator("#modal-title")).toHaveText("Nuovo evento");

    await page.locator("#event-title").fill(title);
    await page.locator("#event-desc").fill("Controllo annuale");
    await page.getByRole("button", { name: "Salva", exact: true }).click();

    await expect(page.locator("#event-modal")).toBeHidden();
    await expect(page.locator("#time-grid .day-event", { hasText: title })).toBeVisible();

    // Tornando alla vista mese l'evento compare nella cella di oggi
    await page.getByRole("button", { name: "Mese" }).click();
    await expect(page.locator(".day-cell.today .event-chip", { hasText: title })).toBeVisible();
  });

  test("senza titolo non salva e mostra un errore", async ({ page }) => {
    await page.getByRole("button", { name: "Giorno", exact: true }).click();
    await page.locator("#time-view").getByRole("button", { name: "+ Nuovo evento" }).click();
    await page.getByRole("button", { name: "Salva", exact: true }).click();

    await expect(page.locator("#modal-error")).toHaveText("Il titolo è obbligatorio");
    await page.getByRole("button", { name: "Annulla" }).click();
  });

  test("l'evento si vede nella vista settimana e nella vista giorno", async ({ page }) => {
    await page.getByRole("button", { name: "Settimana" }).click();
    // 7 colonne (da lunedì a domenica) con l'evento nella colonna di oggi
    await expect(page.locator("#time-grid .time-col")).toHaveCount(7);
    await expect(page.locator(".time-day-header")).toHaveCount(7);
    await expect(page.locator(".time-col.today .day-event", { hasText: title })).toBeVisible();

    await page.getByRole("button", { name: "Giorno", exact: true }).click();
    const block = page.locator("#time-grid .day-event", { hasText: title });
    await expect(block).toBeVisible();
    await expect(block).toContainText("09:00 – 10:00");
    await expect(block).toContainText("Controllo annuale");
    // Nella griglia oraria il blocco parte dalle 9:00 (9 ore x 60px) ed è alto un'ora
    await expect(block).toHaveCSS("top", "540px");
    await expect(block).toHaveCSS("height", "60px");
  });

  test("nella vista giorno, cliccando su un'ora si crea un evento a quell'ora", async ({ page }) => {
    await page.getByRole("button", { name: "Giorno", exact: true }).click();
    // Click nella colonna del giorno all'altezza delle 14:00 (14 ore x 60px + mezz'ora)
    await page.locator(".time-col").click({ position: { x: 300, y: 14 * 60 + 30 } });

    await expect(page.locator("#modal-title")).toHaveText("Nuovo evento");
    await expect(page.locator("#event-start")).toHaveValue(/T14:00$/);
    await expect(page.locator("#event-end")).toHaveValue(/T15:00$/);
    await page.getByRole("button", { name: "Annulla" }).click();
  });

  test("dalla settimana, cliccando sul giorno si apre la vista giorno", async ({ page }) => {
    await page.getByRole("button", { name: "Settimana" }).click();
    await page.locator(".time-day-header.today").click();

    await expect(page.getByRole("button", { name: "Giorno", exact: true })).toHaveClass(/active/);
    await expect(page.locator("#time-grid .time-col")).toHaveCount(1);
    await expect(page.locator("#time-grid .day-event", { hasText: title })).toBeVisible();
  });

  test("nella lista i filtri mostrano l'evento di oggi", async ({ page }) => {
    await page.getByRole("button", { name: "📋 I miei eventi" }).click();
    await expect(page.locator(".event-list-item", { hasText: title })).toBeVisible();

    for (const filter of ["Oggi", "Questa settimana", "Questo mese"]) {
      await page.getByRole("button", { name: filter }).click();
      await expect(page.locator(".event-list-item", { hasText: title })).toBeVisible();
    }
  });

  test("modifica titolo e orario dell'evento", async ({ page }) => {
    await page.locator(".day-cell.today .event-chip", { hasText: title }).click();
    await expect(page.locator("#modal-title")).toHaveText("Modifica evento");

    await page.locator("#event-title").fill(newTitle);
    // Stesso giorno, ma dalle 15:00 alle 16:30
    const day = (await page.locator("#event-start").inputValue()).slice(0, 10);
    await page.locator("#event-start").fill(`${day}T15:00`);
    await page.locator("#event-end").fill(`${day}T16:30`);
    await page.getByRole("button", { name: "Salva", exact: true }).click();

    await page.getByRole("button", { name: "Giorno", exact: true }).click();
    const block = page.locator("#time-grid .day-event", { hasText: newTitle });
    await expect(block).toContainText("15:00 – 16:30");
    // Un'ora e mezza = 90px
    await expect(block).toHaveCSS("height", "90px");
  });

  test("elimina l'evento", async ({ page }) => {
    // Il browser chiede conferma: accetto
    page.once("dialog", (dialog) => dialog.accept());

    await page.locator(".day-cell.today .event-chip", { hasText: newTitle }).click();
    await page.getByRole("button", { name: "Elimina" }).click();

    await expect(page.locator("#event-modal")).toBeHidden();
    await expect(page.locator(".event-chip", { hasText: newTitle })).toHaveCount(0);
  });
});
