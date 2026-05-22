"""Screenshot the v7-wave build at desktop + mobile."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
OUT.mkdir(exist_ok=True)
URL = "http://127.0.0.1:7843/?cb=v7b"

REVEAL_FIX = "document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));"


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for label, w, h in [("desktop", 1440, 900), ("tablet", 900, 1100), ("mobile", 390, 844)]:
            ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2)
            page = await ctx.new_page()
            await page.goto(URL, wait_until="networkidle")
            await page.wait_for_timeout(800)
            await page.evaluate(REVEAL_FIX)
            await page.wait_for_timeout(400)
            await page.screenshot(path=str(OUT / f"v7-{label}-top.png"))
            await page.screenshot(path=str(OUT / f"v7-{label}-full.png"), full_page=True)
            if label == "desktop":
                stage = page.locator(".hero-wave-stage")
                if await stage.count():
                    await stage.first.screenshot(path=str(OUT / "v7-hero-card.png"))
                section = page.locator("#brands")
                if await section.count():
                    await section.first.scroll_into_view_if_needed()
                    await page.wait_for_timeout(300)
                    await section.first.screenshot(path=str(OUT / "v7-brands-section.png"))
                card = page.locator(".brand-card").first
                await card.hover()
                await page.wait_for_timeout(400)
                await page.screenshot(path=str(OUT / "v7-brandcards-hover.png"))
            await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
