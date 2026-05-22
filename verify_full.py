"""Full-page screenshots — desktop + section snapshots for color audit."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
OUT.mkdir(exist_ok=True)
URL_ENV = "http://127.0.0.1:7843/?cb=v18"

FREEZE = """
window.requestAnimationFrame = function(){ return 0; };
"""
REVEAL_FREEZE = """
document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
const s = document.createElement('style');
s.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
document.head.appendChild(s);
"""

SECTIONS = ["#services", "#how", "#about", "#proof", "#contact"]


async def main():
    import sys
    URL = sys.argv[1] if len(sys.argv) > 1 else URL_ENV
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.add_init_script(FREEZE)
        await page.goto(URL, wait_until="networkidle")
        await page.evaluate(REVEAL_FREEZE)
        await page.wait_for_timeout(400)
        await page.screenshot(path=str(OUT / "vNEXT-full.png"), full_page=True)
        for sel in SECTIONS:
            loc = page.locator(sel)
            if await loc.count():
                try:
                    await loc.first.scroll_into_view_if_needed()
                    await page.wait_for_timeout(150)
                    await loc.first.screenshot(path=str(OUT / f"vNEXT-section-{sel.strip('#')}.png"))
                except Exception as e:
                    print(f"skip {sel}: {e}")
        await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
