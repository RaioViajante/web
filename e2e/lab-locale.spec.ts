import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { base, isolate, viewports } from "./support";

test("Portuguese Lab lists every experiment with active LANG and count-aware filters", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.mobile);
  await page.goto(`${base("lab")}/pt/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("[data-experiment-list] article")).toHaveCount(3);
  for (const title of [
    "classificador de arquivos",
    "estados de execução",
    "setor de boot",
  ])
    await expect(page.locator("[data-experiment-list]")).toContainText(title);
  await expect(page.locator("[data-experiment-list]")).not.toContainText(
    "execution states",
  );
  await expect(page.locator("main time").first()).toHaveAttribute(
    "datetime",
    "2026-09-13",
  );
  await expect(page.locator("main time").first()).toHaveText(
    "13 de setembro de 2026",
  );
  await expect(page.locator("section:has(#notebook) a")).toHaveCount(3);
  await expect(page.locator(".rv-lang")).toHaveAttribute(
    "data-lang-state",
    "link",
  );
  await expect(page.locator(".rv-lang")).toContainText("LANG PT");
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/");
  await page.locator(".rv-lang a").press("Enter");
  await expect(page).toHaveURL(`${base("lab")}/`);
  await expect(page.locator(".rv-lang a")).toHaveAttribute("href", "/pt/");
  await page.goto(`${base("lab")}/pt/`);
  await page.locator('[data-filter="done"]').click();
  await expect(page.locator("[data-filter-result]")).toHaveText(
    "1 experimento",
  );
  await page.locator('[data-filter="active"]').click();
  await expect(page.locator("[data-filter-result]")).toHaveText(
    "2 experimentos",
  );
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator("[data-filter-result]")).toHaveText(
    "3 experimentos",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Portuguese classifier translates live output, preserves actual destination and keyboard access", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.desktop);
  await page.goto(`${base("lab")}/pt/experiments/classificador-de-arquivos/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("main")).toContainText("executa aqui");
  await expect(page.locator("[data-summary]")).toContainText("Imagens 1");
  await page.locator("#filenames").fill("photo.png\nREADME");
  await page.locator("[data-classify]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-summary]")).toHaveText(
    "2 arquivos classificados · Imagens 1 · Documentos 0 · Arquivos compactados 0 · Outros 1",
  );
  await expect(
    page.locator("tbody tr").first().locator("td").nth(1),
  ).toHaveText("Imagens");
  await page.locator("#filenames").fill("");
  await expect(page.locator("[data-summary]")).toHaveText(
    "nenhum arquivo classificado · Imagens 0 · Documentos 0 · Arquivos compactados 0 · Outros 0",
  );
  await page.locator("#filenames").fill("photo.png");
  await expect(page.locator("[data-summary]")).toHaveText(
    "1 arquivo classificado · Imagens 1 · Documentos 0 · Arquivos compactados 0 · Outros 0",
  );
  await expect(page.locator("tbody")).toContainText(
    "~/Downloads/Images/photo.png",
  );
  await expect(page.locator("tbody tr td").last().locator("[lang]")).toHaveText(
    "Images",
  );
  await expect(
    page.locator("tbody tr td").last().locator("[lang]"),
  ).toHaveAttribute("lang", "en");
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute(
    "href",
    "https://lab.raioviajante.com/experiments/filename-classifier/",
  );
  await expect(page.locator(".rv-lang a")).toHaveAttribute(
    "href",
    "/experiments/filename-classifier/",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Portuguese search is locale-pure, English slugs under /pt use the English 404 and English pages link their counterparts", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("lab")}/pt/search/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator('[data-search-locale="pt-BR"]')).toBeVisible();
  await expect(page.locator("[data-search-page]")).toHaveAttribute(
    "data-search-state",
    "ready",
  );
  await page.locator("[data-search-input]").fill("classificador");
  await expect(page.locator("[data-search-result]")).toHaveCount(1);
  await expect(page.locator("[data-search-result]")).toContainText(
    "classificador de arquivos",
  );
  const index = await page.request.get(`${base("lab")}/pt/search-index.json`);
  expect(index.ok()).toBe(true);
  expect(await index.json()).toEqual([
    expect.objectContaining({
      contentId: "003",
      locale: "pt-BR",
      href: "https://lab.raioviajante.com/pt/experiments/setor-de-boot/",
    }),
    expect.objectContaining({
      contentId: "002",
      locale: "pt-BR",
      href: "https://lab.raioviajante.com/pt/experiments/estados-de-execucao/",
    }),
    expect.objectContaining({
      contentId: "001",
      locale: "pt-BR",
      href: "https://lab.raioviajante.com/pt/experiments/classificador-de-arquivos/",
    }),
  ]);
  const missing = await page.request.get(
    `${base("lab")}/pt/experiments/execution-states/`,
  );
  expect(missing.status()).toBe(404);
  const html = await missing.text();
  expect(html).toContain('<html lang="en"');
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(html).not.toContain('rel="canonical"');
  for (const [path, counterpart] of [
    ["/experiments/execution-states/", "/pt/experiments/estados-de-execucao/"],
    ["/experiments/boot-sector/", "/pt/experiments/setor-de-boot/"],
    ["/terms/", "/pt/terms/"],
    ["/privacy/", "/pt/privacy/"],
  ] as const) {
    await page.goto(base("lab") + path);
    await expect(page.locator(".rv-lang")).toHaveAttribute(
      "data-lang-state",
      "link",
    );
    await expect(page.locator(".rv-lang a")).toHaveAttribute(
      "href",
      counterpart,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="pt-BR"]'),
    ).toHaveAttribute("href", `https://lab.raioviajante.com${counterpart}`);
  }
});

test("every Portuguese Lab suggestion leads to the experiment it names in both scopes", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("lab")}/pt/search/`);
  await expect(page.locator("[data-search-page]")).toHaveAttribute(
    "data-search-state",
    "ready",
  );
  for (const scope of ["site", "everywhere"]) {
    await page.locator(`[data-search-scope="${scope}"]`).click();
    await page.locator("[data-search-input]").fill("no-match-for-lab");
    const suggestions = page.locator(
      `[data-search-suggestions="${scope}"] [data-search-suggestion]`,
    );
    await expect(suggestions.first()).toBeVisible();
    const terms = await suggestions.allTextContents();
    expect(terms).toEqual(["classificador", "execução", "boot"]);
    const destination = {
      classificador: "classificador-de-arquivos",
      execução: "estados-de-execucao",
      boot: "setor-de-boot",
    } as const;
    for (const [index, term] of terms.entries()) {
      const button = page
        .locator(`[data-search-suggestions="${scope}"]`)
        .getByRole("button", { name: term, exact: true });
      if (index === 0) {
        await button.focus();
        await expect(button).toBeFocused();
        await page.keyboard.press("Enter");
      } else await button.click();
      await expect(page.locator("[data-search-input]")).toHaveValue(term);
      await expect(page.locator("[data-search-input]")).toBeFocused();
      await expect(
        page.locator(
          `[data-search-result][href="${base("lab")}/pt/experiments/${destination[term as keyof typeof destination]}/"]`,
        ),
      ).toHaveCount(1);
      await page.locator("[data-search-input]").fill("no-match-for-lab");
    }
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Lab avatar keeps language-specific names with and without reduced motion", async ({
  page,
}) => {
  await isolate(page, []);
  for (const [path, interactive, reduced] of [
    ["/", "Flip RaioViajante avatar", "Illustrated RaioViajante character"],
    [
      "/pt/",
      "Virar o avatar do RaioViajante",
      "Personagem ilustrado do RaioViajante",
    ],
  ] as const) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(base("lab") + path);
    const avatar = page.locator(".avatar-coin");
    await expect(avatar).toHaveAttribute("aria-label", interactive);
    await avatar.focus();
    await expect(avatar).toBeFocused();
    expect(
      await avatar.evaluate((button) => getComputedStyle(button).outlineStyle),
    ).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(avatar).toHaveClass(/is-flipping/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(avatar).toHaveAttribute("aria-label", reduced);
    await expect(avatar).toBeDisabled();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(avatar).toHaveAttribute("aria-label", interactive);
    await expect(avatar).toBeEnabled();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test("Portuguese execution states bench words every outcome and behaves like the English one", async ({
  page,
}) => {
  await isolate(page, []);
  for (const viewport of [viewports.desktop, viewports.mobile]) {
    await page.setViewportSize(viewport);
    await page.goto(`${base("lab")}/pt/experiments/estados-de-execucao/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    const feedback = page.locator("[data-feedback]");
    await expect(feedback).toHaveAttribute("role", "status");
    await expect(page.locator("[data-availability]")).toHaveText(
      "Aceitas agora: iniciar, cancelar. Rejeitadas agora: concluir com sucesso, falhar.",
    );
    // A dotted (rejected) control stays clickable and leaves the state alone.
    await page.locator('[data-operation="succeed"]').click({ force: true });
    await expect(feedback).toContainText(
      "Operação “concluir com sucesso” rejeitada: Só execuções em andamento podem ser concluídas com sucesso.",
    );
    await expect(feedback).toContainText("O estado continua QUEUED.");
    await expect(page.locator('[data-field="status"]')).toHaveText("QUEUED");
    await page.locator('[data-operation="start"]').focus();
    await page.keyboard.press("Enter");
    await expect(feedback).toHaveText("Operação “iniciar” aceita → RUNNING.");
    await expect(page.locator('[data-field="status"]')).toHaveText("RUNNING");
    await page.locator("#failure-message").fill("   ");
    await page.locator('[data-operation="fail"]').click();
    await expect(feedback).toContainText(
      "A mensagem de erro não pode estar em branco",
    );
    await page.locator("#failure-message").fill("boom");
    await page.locator("#exit-code").fill("7");
    await page.locator('[data-operation="fail"]').click();
    await expect(page.locator('[data-field="status"]')).toHaveText("FAILED");
    await expect(page.locator('[data-field="exitCode"]')).toHaveText("7");
    await expect(page.locator("[data-history] li").last()).toHaveText(
      "aceita: falhar → FAILED",
    );
    await page.locator("[data-new]").click();
    await expect(feedback).toContainText(
      "Nova execução de exemplo criada em QUEUED",
    );
    await expect(page.locator("#failure-message")).toHaveValue(
      "Falha de exemplo",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test("Portuguese boot sector bench keeps the source exact and words the progress", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.mobile);
  await page.goto(`${base("lab")}/pt/experiments/setor-de-boot/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  const progress = page.locator("[data-progress]");
  await expect(progress).toHaveText("1 / 5 · entrada");
  await page.locator("[data-prev]").click({ force: true });
  await expect(progress).toHaveText("rejeitado: não há seção anterior · 1 / 5");
  await page.locator("[data-next]").click();
  await expect(progress).toHaveText("2 / 5 · inicialização");
  await expect(page.locator('[data-panel="1"]')).toContainText(
    "mov sp, 0x7C00",
  );
  await page.locator('[data-section="1"]').focus();
  await page.keyboard.press("End");
  await expect(progress).toHaveText("5 / 5 · fim do setor");
  await expect(page.locator('[data-panel="4"]')).toContainText("dw 0xAA55");
  await expect(page.locator('[data-panel="4"]')).toContainText("55 AA");
  await page.locator("[data-next]").click({ force: true });
  await expect(progress).toHaveText("rejeitado: não há próxima seção · 5 / 5");
  await expect(page.locator("main")).toContainText(
    "resultado documentado · qemu",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("Portuguese Terms and Privacy are declared, linked from the footer without the English qualifier and accessible", async ({
  page,
}) => {
  await isolate(page, []);
  await page.setViewportSize(viewports.mobile);
  for (const [path, title, other, counterpart] of [
    ["/pt/terms/", "Termos de Uso", "/pt/privacy/", "/terms/"],
    ["/pt/privacy/", "Política de Privacidade", "/pt/terms/", "/privacy/"],
  ] as const) {
    await page.goto(base("lab") + path);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator("h1")).toHaveText(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://lab.raioviajante.com${path}`,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", `https://lab.raioviajante.com${counterpart}`);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]'),
    ).toHaveAttribute("href", `https://lab.raioviajante.com${counterpart}`);
    await expect(page.locator(".rv-lang a")).toHaveAttribute(
      "href",
      counterpart,
    );
    const footer = page.locator("footer nav[aria-label] a", {
      hasText: /Termos de Uso|Política de Privacidade/,
    });
    await expect(footer).toHaveCount(2);
    for (const link of await footer.all()) {
      await expect(link).not.toContainText("em inglês");
      await expect(link).not.toHaveAttribute("hreflang", /./);
      expect(["/pt/terms/", "/pt/privacy/"]).toContain(
        await link.getAttribute("href"),
      );
    }
    await expect(page.locator(`main a[href="${other}"]`)).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  // The social card of each Portuguese page exists.
  for (const card of ["terms", "privacy", "experiments/setor-de-boot"]) {
    const response = await page.request.get(`${base("lab")}/og/pt/${card}.png`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("every experiment renders its notes under Fidelity in both languages", async ({
  page,
}) => {
  await isolate(page, []);
  const pages = [
    ["", "boot-sector", "Based on x86-os-experiment revision e966889."],
    ["", "execution-states", "Based on Orbit revision cd97666."],
    ["", "filename-classifier", "Based on Sweep revision 3544d36."],
    [
      "/pt",
      "setor-de-boot",
      "Baseado na revisão e966889 do x86-os-experiment.",
    ],
    ["/pt", "estados-de-execucao", "Baseado na revisão cd97666 do Orbit."],
    [
      "/pt",
      "classificador-de-arquivos",
      "Baseado na revisão 3544d36 do Sweep.",
    ],
  ] as const;
  for (const [prefix, slug, notes] of pages) {
    await page.goto(`${base("lab")}${prefix}/experiments/${slug}/`);
    await expect(
      page.locator("section", { hasText: /^03\./ }).locator("p"),
    ).toContainText(notes);
  }
});

test("the Portuguese notebook entries agree with their titles", async ({
  page,
}) => {
  await isolate(page, []);
  await page.goto(`${base("lab")}/pt/`);
  const entries = page.locator("section:has(#notebook) a");
  await expect(entries.nth(0)).toContainText("setor de boot registrado");
  await expect(entries.nth(1)).toContainText("estados de execução registrados");
  await expect(entries.nth(2)).toContainText(
    "classificador de arquivos registrado",
  );
});
