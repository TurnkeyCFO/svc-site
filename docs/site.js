// Turnkey Services — site.js v2
// Mobile nav + IntersectionObserver reveals + count-up + cursor spotlight.
(function () {
  'use strict';

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Mobile nav ─────────────────────────────────────────────
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('desktop-nav');
  if (toggle && nav) {
    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 980) closeNav();
      });
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) closeNav();
    });
  }

  // ── Sticky header height as CSS var (used for scroll-margin) ──
  function setHeaderH() {
    var header = document.querySelector('.topbar');
    if (!header) return;
    var h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  // ── Reveal on scroll ──────────────────────────────────────
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  // ── Count-up on first view ─────────────────────────────────
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !prefersReduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1300;
        var start = performance.now();
        function frame(t) {
          var p = Math.min(1, (t - start) / duration);
          // ease-out cubic
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(frame);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(frame);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // ── Cursor spotlight on brand grid (desktop only) ──────────
  var grid = document.getElementById('brandGrid');
  if (grid && !prefersReduced && window.matchMedia('(hover: hover)').matches) {
    var rafId = null;
    var pendingX = 50, pendingY = 50;
    function flush() {
      grid.style.setProperty('--mx', pendingX + '%');
      grid.style.setProperty('--my', pendingY + '%');
      rafId = null;
    }
    grid.addEventListener('mouseenter', function () {
      grid.classList.add('is-tracking');
    });
    grid.addEventListener('mouseleave', function () {
      grid.classList.remove('is-tracking');
    });
    grid.addEventListener('mousemove', function (e) {
      var rect = grid.getBoundingClientRect();
      pendingX = ((e.clientX - rect.left) / rect.width) * 100;
      pendingY = ((e.clientY - rect.top) / rect.height) * 100;
      if (rafId === null) rafId = requestAnimationFrame(flush);
    });
  }
})();
