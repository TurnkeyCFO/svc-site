// Turnkey Services — site.js
// Light interactions only. Fades, nav scroll state, stat count-up.

(function () {
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // intersection-observer fades
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

  // stat count-up
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
        function tick(now) {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          el.textContent = val.toFixed(decimals) + suffix;
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(decimals) + suffix;
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach((s) => cio.observe(s));
  }

  // marker year
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
