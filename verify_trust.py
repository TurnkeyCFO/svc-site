"""Closeup on trust strip + footer + steps row."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
URL = "http://127.0.0.1:7843/?cb=v21"

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
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.add_init_script(FREEZE)
        await page.goto(URL, wait_until="networkidle")
        await page.evaluate(REVEAL_FREEZE)
        await page.wait_for_timeout(300)
        for sel, name in [
            (".trust-strip", "trust"),
            (".steps-grid", "steps"),
            (".faq-list", "faq"),
            (".site-footer", "footer"),
        ]:
            loc = page.locator(sel).first
            try:
                await loc.scroll_into_view_if_needed()
                await page.wait_for_timeout(150)
                await loc.screenshot(path=str(OUT / f"vNEXT-{name}.png"))
            except Exception as e:
                print(f"skip {sel}: {e}")
        await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
