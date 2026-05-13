# Turnkey Services — Launchpad

Parent-brand marketing site for **Turnkey Services**, the holding company behind:

- **Turnkey CFO** — bookkeeping & finance ops · [turnkeycfo.com](https://turnkeycfo.com)
- **Turnkey WEB** — websites & site care · [turnkeyweb.org](https://turnkeyweb.org)
- **Turnkey AI** — automation & agents (new)

## Stack

- Static HTML/CSS/JS (no build step)
- GitHub Pages from `main:/docs`
- Plus Jakarta Sans + Bricolage Grotesque + Fraunces + JetBrains Mono via Google Fonts

## Pages

| File | Purpose |
| --- | --- |
| `docs/index.html` | Home — hero, brand promise, three-card family, system rows, manifesto, CTA |
| `docs/about.html` | About — four operating principles |
| `docs/family.html` | The Family — full sub-brand detail + "how they compound" matrix |
| `docs/contact.html` | Contact — 4 channels (Calendly, email, sub-brand direct, phone) |

## Local dev

```
cd docs
python -m http.server 8765
# open http://127.0.0.1:8765/
```

## Screenshot iteration

```
python screenshot.py <label>
# writes pass screenshots into ./screenshots/
```

---

© Turnkey Services · Austin, TX
