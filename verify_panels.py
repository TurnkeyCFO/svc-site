"""Hover each accordion panel and screenshot the active state for review."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
OUT.mkdir(exist_ok=True)
URL = "http://127.0.0.1:7843/?cb=v30"

PANELS = ["cfo", "web", "ai", "seo", "design"]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.goto(URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(800)

        accordion = page.locator("#svcAccordion")
        await accordion.scroll_into_view_if_needed()
        await page.wait_for_timeout(300)

        for slug in PANELS:
            sel = f'[data-svc="{slug}"]'
            panel = page.locator(sel).first
            await panel.hover()
            await page.wait_for_timeout(700)  # let CSS transition finish
            try:
                await accordion.screenshot(path=str(OUT / f"v30-accordion-{slug}.png"), timeout=6000)
            except Exception as e:
                print(f"snap {slug} failed: {e}")

        await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
