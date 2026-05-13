"""Screenshot all 4 pages at desktop + mobile widths into ./screenshots/."""
import sys, os, asyncio, http.server, socketserver, threading, pathlib, time

ROOT = pathlib.Path(__file__).resolve().parent
DOCS = ROOT / "docs"
SHOTS = ROOT / "screenshots"
SHOTS.mkdir(exist_ok=True)
LABEL = sys.argv[1] if len(sys.argv) > 1 else "pass"

PAGES = ["index.html", "about.html", "family.html", "contact.html"]
PORT = 8765

# Suppress logging
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass

os.chdir(DOCS)
server = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
time.sleep(0.3)

async def main():
    from playwright.async_api import async_playwright
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        try:
            for page_name in PAGES:
                stem = page_name.replace(".html", "")
                for label, w, h, full in [
                    ("desktop", 1440, 900, True),
                    ("mobile", 414, 896, True),
                ]:
                    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1.5)
                    page = await ctx.new_page()
                    url = f"http://127.0.0.1:{PORT}/{page_name}"
                    await page.goto(url, wait_until="networkidle")
                    await page.wait_for_timeout(500)
                    # Force-fire all fade-ins so full-page screenshot isn't blank below the fold
                    await page.evaluate("document.querySelectorAll('.fade').forEach(el => el.classList.add('in'))")
                    # Scroll through page so any lazy work fires, then back to top
                    await page.evaluate("""async () => {
                      const h = document.body.scrollHeight;
                      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
                      window.scrollTo(0, 0);
                    }""")
                    await page.wait_for_timeout(900)
                    out = SHOTS / f"{LABEL}_{stem}_{label}.png"
                    await page.screenshot(path=str(out), full_page=full)
                    print("wrote", out.name)
                    await ctx.close()
        finally:
            await browser.close()

asyncio.run(main())
server.shutdown()
print("done")
