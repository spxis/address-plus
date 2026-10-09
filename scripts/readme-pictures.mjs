// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo,
// then runs this). The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is
// readme-pictures-lib.mjs. The page is served to a browser without a port, never fetched from the live site, and the
// same each run: every panel starts from its own example, and motion is reduced. It waits on the page saying it is
// ready, never on a clock. Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const READY = 'main[data-ready="true"]';

await takePictures({
  shots: [
    // From the top of the page, so the header, the language chooser, the cloth patches and the first panels show.
    // On a phone, in Japanese, with the Japanese example parsed.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: "/?lang=en&help=off",
      ready: READY,
      height: 1100,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto("http://address-plus.test/?lang=ja&help=off");
          await page.waitForSelector(READY);
          await page.locator('[data-testid="parse-examples"] button').nth(6).click();
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      },
    },
  ],
});
