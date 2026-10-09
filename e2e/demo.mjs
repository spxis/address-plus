// What every demo test starts from: the built demo in `site/`, served to the page without a port, and the helpers a
// test plays with.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

/** Serve `site/` to a page at http://address-plus.test/. */
export async function serve(page) {
  if (!existsSync(join(site, "index.html")))
    throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:demo` does)");
  await page.route("http://address-plus.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, decodeURIComponent(pathname.endsWith("/") ? `${pathname}index.html` : pathname));
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({
      body: readFileSync(file),
      contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream",
    });
  });
}

/** Collect anything the page complains of. */
function listen(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  return errors;
}

export const at = (id) => `[data-testid="${id}"]`;

/** Open a page of the demo with a query and wait until its panels are written; returns what the page complains of. */
export async function open(page, query = "", path = "") {
  const errors = listen(page);
  await serve(page);
  await page.goto(`http://address-plus.test/${path}${query}`);
  if (path === "") await page.waitForSelector('main[data-ready="true"]');
  return errors;
}

/** Type into a field the way a person does, replacing what is there. */
export async function type(page, id, text) {
  await page.locator(at(id)).fill(text);
}

/** Nothing the demo drew sits beyond the page's own width. */
export async function noSidewaysScroll(page) {
  const [scroll, client] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(scroll).toBeLessThanOrEqual(client);
}

/** Tap, as a finger would where the page is touched and as a mouse where it is not. */
export async function tap(page, selector, testInfo) {
  const target = typeof selector === "string" ? page.locator(selector).first() : selector;
  await target.scrollIntoViewIfNeeded();
  if (testInfo.project.use.hasTouch === true) await target.tap();
  else await target.click();
}
