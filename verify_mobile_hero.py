"""Mobile hero accordion — hover each panel + capture."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
URL = "http://127.0.0.1:7843/?cb=v25"

FREEZE = """window.requestAnimationFrame = function(){ return 0; };"""

PANELS = ["cfo", "web", "ai", "seo", "design"]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.add_init_script(FREEZE)
        await page.goto(URL, wait_until="domcontentloaded")
        await page.wait_for_timeout(800)
        acc = page.locator("#svcAccordion").first
        await acc.scroll_into_view_if_needed()
        await page.wait_for_timeout(300)
        for slug in PANELS:
            panel = page.locator(f'[data-svc="{slug}"]').first
            await panel.click(force=True)
            await page.wait_for_timeout(500)
            try:
                await acc.screenshot(path=str(OUT / f"vNEXT-mobile-hero-{slug}.png"), timeout=6000)
            except Exception as e:
                print(f"snap {slug} failed: {e}")
        await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
