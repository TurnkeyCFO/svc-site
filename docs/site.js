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

  // ── Site-wide cursor spotlight (light + dark sections) ─────
  if (!prefersReduced && window.matchMedia('(hover: hover)').matches && window.matchMedia('(pointer: fine)').matches) {
    var spot = document.createElement('div');
    spot.className = 'cursor-spotlight';
    spot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spot);
    var spotRaf = null, sx = 50, sy = 50, lastY = 0;
    function spotFlush() {
      spot.style.setProperty('--cx', sx + 'px');
      spot.style.setProperty('--cy', sy + 'px');
      // Detect dark section under cursor → swap blend mode
      var el = document.elementFromPoint(sx, sy);
      var onDark = false;
      while (el && el !== document.body) {
        if (el.classList && (el.classList.contains('hero') || el.classList.contains('cta-band') || el.classList.contains('site-footer'))) {
          onDark = true; break;
        }
        el = el.parentElement;
      }
      document.body.classList.toggle('cursor-on-dark', onDark);
      spotRaf = null;
    }
    document.addEventListener('mousemove', function (e) {
      sx = e.clientX; sy = e.clientY;
      if (!spot.classList.contains('is-visible')) spot.classList.add('is-visible');
      if (spotRaf === null) spotRaf = requestAnimationFrame(spotFlush);
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      spot.classList.remove('is-visible');
    });
  }

  // ── Ask Turnkey (LLM) ──────────────────────────────────────
  (function initAsk() {
    var form = document.getElementById('askForm');
    var input = document.getElementById('askInput');
    var output = document.getElementById('askOutput');
    if (!form || !input || !output) return;
    var inflight = false;

    function setLoading(on) {
      if (on) {
        output.hidden = false;
        output.textContent = 'Thinking';
        output.classList.add('is-loading');
      } else {
        output.classList.remove('is-loading');
      }
    }

    function render(answer, cta) {
      output.classList.remove('is-loading');
      output.innerHTML = '';
      var p = document.createElement('div');
      p.textContent = answer;
      output.appendChild(p);
      if (cta) {
        var c = document.createElement('p');
        c.style.marginTop = '12px';
        c.innerHTML = '<strong>' + cta + '</strong> · <a href="https://calendly.com/ricky-turnkeycfo/15min-intro-call" target="_blank" rel="noreferrer">Book a 15-min call</a> · <a href="mailto:ricky@turnkey-services.org">ricky@turnkey-services.org</a>';
        output.appendChild(c);
      }
    }

    function renderError(msg) {
      output.classList.remove('is-loading');
      output.innerHTML = '';
      var p = document.createElement('div');
      p.textContent = msg;
      output.appendChild(p);
      var c = document.createElement('p');
      c.style.marginTop = '12px';
      c.innerHTML = 'The fastest answer is a 15-min call. <a href="https://calendly.com/ricky-turnkeycfo/15min-intro-call" target="_blank" rel="noreferrer">Book one →</a>';
      output.appendChild(c);
    }

    function ask(q) {
      if (inflight) return;
      if (!q || q.length < 6) { input.focus(); return; }
      inflight = true;
      setLoading(true);
      var ctrl = new AbortController();
      var t = setTimeout(function () { ctrl.abort(); }, 16000);
      fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.slice(0, 600) }),
        signal: ctrl.signal
      }).then(function (r) {
        clearTimeout(t);
        return r.json().then(function (j) { return { ok: r.ok, body: j }; });
      }).then(function (res) {
        inflight = false;
        if (res.ok && res.body && res.body.answer) {
          render(res.body.answer, res.body.cta || 'Want to talk it through?');
        } else {
          renderError("We're getting that brain online. In the meantime, the fastest answer is a quick call.");
        }
      }).catch(function () {
        clearTimeout(t);
        inflight = false;
        renderError("We're getting that brain online. In the meantime, the fastest answer is a quick call.");
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask((input.value || '').trim());
    });

    document.querySelectorAll('.ask-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var q = chip.getAttribute('data-q') || chip.textContent;
        input.value = q;
        ask(q);
      });
    });
  })();

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
