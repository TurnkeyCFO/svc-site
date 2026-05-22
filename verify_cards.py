"""Capture brand-grid on desktop + mobile to verify logo placement + SEO color."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
URL = "http://127.0.0.1:7843/?cb=v24"

FREEZE = """window.requestAnimationFrame = function(){ return 0; };"""
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
            await page.add_init_script(FREEZE)
            await page.goto(URL, wait_until="networkidle")
            await page.evaluate(REVEAL_FREEZE)
            await page.wait_for_timeout(300)
            grid = page.locator("#brandGrid").first
            await grid.scroll_into_view_if_needed()
            await page.wait_for_timeout(150)
            await grid.screenshot(path=str(OUT / f"vNEXT-grid-{label}.png"))
            # Also do the hero so we see the SEO panel in the accordion
            hero = page.locator("#svcAccordion").first
            await hero.scroll_into_view_if_needed()
            await page.wait_for_timeout(150)
            # On mobile, hover SEO; on desktop too
            seo = page.locator('[data-svc="seo"]').first
            await seo.hover()
            await page.wait_for_timeout(400)
            await hero.screenshot(path=str(OUT / f"vNEXT-accordion-seo-{label}.png"))
            await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
