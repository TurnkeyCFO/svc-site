"""Screenshot the v9 build at desktop + mobile (animations + canvas RAF frozen)."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
OUT.mkdir(exist_ok=True)
URL = "http://127.0.0.1:7843/?cb=v13"

FREEZE_FIRST = """
// Override requestAnimationFrame BEFORE any scripts run so the canvas RAF loops
// never start in the first place.
window.requestAnimationFrame = function(){ return 0; };
"""

REVEAL_FREEZE = """
document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
const s = document.createElement('style');
s.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
document.head.appendChild(s);
"""


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, w, h in [("desktop", 1440, 900), ("mobile", 390, 844)]:
            ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
            page = await ctx.new_page()
            # Page 1: LIVE animations (single 1-shot screenshot, viewport only)
            await page.goto(URL, wait_until="domcontentloaded")
            await page.wait_for_timeout(1500)
            try:
                await page.screenshot(path=str(OUT / f"v9-{label}-top-live.png"),
                                      timeout=8000, animations="disabled")
            except Exception as e:
                print(f"live shot skipped ({label}): {e}")
            await ctx.close()

            # Page 2: frozen — for the brittle full-page + services-section captures
            ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
            page = await ctx.new_page()
            await page.add_init_script(FREEZE_FIRST)
            await page.goto(URL, wait_until="networkidle")
            await page.wait_for_timeout(400)
            await page.evaluate(REVEAL_FREEZE)
            await page.wait_for_timeout(200)
            await page.screenshot(path=str(OUT / f"v9-{label}-top.png"))
            await page.screenshot(path=str(OUT / f"v9-{label}-full.png"), full_page=True)
            if label == "desktop":
                section = page.locator("#services")
                if await section.count():
                    await section.first.scroll_into_view_if_needed()
                    await page.wait_for_timeout(200)
                    await section.first.screenshot(path=str(OUT / "v9-services-section.png"))
            await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
