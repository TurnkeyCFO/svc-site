"""Verify descender clearance on every gradient-clipped header on the page,
plus the new accordion logo position, plus the CTA copy swap."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "docs" / "screenshots"
URL = "http://127.0.0.1:7843/?cb=v29"

FREEZE = """window.requestAnimationFrame = function(){ return 0; };"""
REVEAL = """
document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
const s = document.createElement('style');
s.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
document.head.appendChild(s);
"""

# Sections with H2s that have descenders to verify
SECTIONS = [
    (".hero-headline", "hero-h1"),
    ("#services .section-head", "services-h2"),
    ("#about .section-head", "about-h2"),
    (".cta-band", "cta-h2"),
    ("#faq .section-head", "faq-h2"),
]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page()
        await page.add_init_script(FREEZE)
        await page.goto(URL, wait_until="networkidle")
        await page.evaluate(REVEAL)
        await page.wait_for_timeout(300)
        for sel, name in SECTIONS:
            loc = page.locator(sel).first
            if await loc.count() == 0:
                continue
            try:
                await loc.scroll_into_view_if_needed()
                await page.wait_for_timeout(150)
                await loc.screenshot(path=str(OUT / f"vNEXT-hdr-{name}.png"), timeout=6000)
            except Exception as e:
                print(f"skip {sel}: {e}")
        # Accordion CFO active state to verify the new logo position
        acc = page.locator("#svcAccordion").first
        await acc.scroll_into_view_if_needed()
        await page.wait_for_timeout(150)
        await acc.screenshot(path=str(OUT / "vNEXT-acc-cfo.png"))
        await ctx.close()
        await browser.close()
    print("done")


asyncio.run(main())
