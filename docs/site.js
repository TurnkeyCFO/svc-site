// Turnkey Services — site.js  v5
// Fades, nav state, pulse-wave parallax, twinkling particles, stat count-up.

(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── nav scroll state ──
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── intersection-observer fades ──
  const fades = document.querySelectorAll(".fade");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    fades.forEach((f) => io.observe(f));
  } else {
    fades.forEach((f) => f.classList.add("in"));
  }

  // ── twinkling spark particles ──
  const sparkLayer = document.querySelector(".sparks");
  if (sparkLayer && !reduce) {
    const tints = ["#22D3EE", "#2E9BFF", "#8B5CFF", "#FF2D9C", "#FF8A1E", "#00E676", "#FFFFFF"];
    const count = window.innerWidth < 680 ? 16 : 30;
    let html = "";
    for (let i = 0; i < count; i++) {
      const c = tints[(Math.random() * tints.length) | 0];
      const size = (Math.random() * 2 + 1.4).toFixed(1);
      html +=
        '<span class="spark" style="' +
        "left:" + (Math.random() * 100).toFixed(2) + "%;" +
        "top:" + (Math.random() * 100).toFixed(2) + "%;" +
        "color:" + c + ";background:" + c + ";" +
        "width:" + size + "px;height:" + size + "px;" +
        "animation-duration:" + (Math.random() * 5 + 4).toFixed(1) + "s;" +
        "animation-delay:" + (-Math.random() * 8).toFixed(1) + 's">' +
        "</span>";
    }
    sparkLayer.innerHTML = html;
  }

  // ── depth parallax — pointer + scroll move the pulse-field layers ──
  const layers = Array.prototype.map.call(
    document.querySelectorAll(".pulse-field [data-depth]"),
    (el) => ({ el, depth: parseFloat(el.dataset.depth) || 0 })
  );
  if (layers.length && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const sy = window.scrollY;
      for (let i = 0; i < layers.length; i++) {
        const d = layers[i].depth;
        const px = -cx * d;
        const py = -cy * d - sy * (d / 900);
        layers[i].el.style.transform =
          "translate3d(" + px.toFixed(2) + "px," + py.toFixed(2) + "px,0)";
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── stat count-up ──
  const stats = document.querySelectorAll("[data-count]");
  if (stats.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const dur = 1400;
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach((s) => cio.observe(s));
  }

  // ── marker year ──
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
