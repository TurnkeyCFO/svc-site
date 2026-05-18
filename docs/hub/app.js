/* ============================================================
   Turnkey Services — Site Directory  ·  app logic
   ============================================================ */
'use strict';

/* ---- industry slug -> display name ---- */
const SPECIAL_NAMES = { hvac: 'HVAC', 'med-spa': 'Med Spa', 'atx': 'ATX' };
function titleCase(slug) {
  if (SPECIAL_NAMES[slug]) return SPECIAL_NAMES[slug];
  return slug.split('-')
    .map(w => SPECIAL_NAMES[w] || w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ---- generate the 60 industry rows (Web + AI share the slug set) ---- */
const INDUSTRY_SITES = [];
INDUSTRIES.forEach(slug => {
  INDUSTRY_SITES.push({
    brand: 'web', cat: 'industry', slug, name: titleCase(slug),
    url: 'https://turnkeyweb.org/industries/' + slug + '/',
    note: 'Turnkey Web industry page', status: 'live'
  });
  INDUSTRY_SITES.push({
    brand: 'ai', cat: 'industry', slug, name: titleCase(slug),
    url: 'https://turnkeyai.org/industries/' + slug + '/',
    note: 'Turnkey AI industry page', status: 'live'
  });
});

const ALL = SITES.concat(INDUSTRY_SITES);

/* ---- filter chips ---- */
const CHIPS = [
  { key: 'all',      label: 'All' },
  { key: 'hub',      label: 'Brand Hubs' },
  { key: 'page',     label: 'Pages' },
  { key: 'industry', label: 'Niche Pages' },
  { key: 'demo',     label: 'Demos' },
  { key: 'client',   label: 'Client Sites' }
];

/* ---- state ---- */
let activeCat = 'all';
let query = '';
const expanded = {};   /* per-brand industry block open state */

/* ---- elements ---- */
const $results = document.getElementById('results');
const $empty   = document.getElementById('empty');
const $search  = document.getElementById('search');
const $clear   = document.getElementById('clearSearch');
const $chips   = document.getElementById('chips');
const $foot    = document.getElementById('footMeta');
const $toast   = document.getElementById('toast');

/* ============================================================
   Filtering helpers
   ============================================================ */
function catOk(s)  { return activeCat === 'all' || s.cat === activeCat; }
function qOk(s) {
  if (!query) return true;
  const hay = (s.name + ' ' + s.url + ' ' + (s.note || '') + ' ' +
               BRANDS[s.brand].name).toLowerCase();
  return hay.includes(query);
}

/* ============================================================
   Card builders
   ============================================================ */
function shortUrl(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function openSite(url) {
  if (!url) { toast('Link not set yet'); return; }
  window.open(url, '_blank', 'noopener');
}

function makeCard(s) {
  const color = BRANDS[s.brand].color;
  const card = document.createElement('div');
  card.className = 'card' + (s.url ? '' : ' pending');
  card.style.setProperty('--c', color);

  const body = document.createElement('div');
  body.className = 'card-body';

  const name = document.createElement('div');
  name.className = 'card-name';
  if (s.status === 'live' && s.url) {
    const dot = document.createElement('span');
    dot.className = 'live-dot';
    name.appendChild(dot);
  }
  name.appendChild(document.createTextNode(s.name));
  if (s.status === 'pending') {
    const tag = document.createElement('span');
    tag.className = 'pend-tag';
    tag.textContent = s.url ? 'soon' : 'no link';
    name.appendChild(tag);
  }
  body.appendChild(name);

  if (s.url) {
    const u = document.createElement('div');
    u.className = 'card-url';
    u.textContent = shortUrl(s.url);
    body.appendChild(u);
  }
  if (s.note) {
    const n = document.createElement('div');
    n.className = 'card-note';
    n.textContent = s.note;
    body.appendChild(n);
  }
  card.appendChild(body);

  if (s.url) {
    const copy = document.createElement('button');
    copy.className = 'copy-btn';
    copy.setAttribute('aria-label', 'Copy link');
    copy.innerHTML =
      '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/>' +
      '<path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';
    copy.addEventListener('click', e => { e.stopPropagation(); copyLink(s.url); });
    card.appendChild(copy);
  }

  card.addEventListener('click', () => openSite(s.url));
  return card;
}

function makeIndustryBlock(brandKey, items) {
  const block = document.createElement('div');
  block.className = 'ind-block';

  const forceOpen = !!query || activeCat === 'industry';
  const open = forceOpen || !!expanded[brandKey];

  const toggle = document.createElement('button');
  toggle.className = 'ind-toggle';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.innerHTML =
    '<span>🏭 Niche / Industry Pages</span>' +
    '<span class="ind-c">' + items.length + '</span>' +
    '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" ' +
    'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

  const grid = document.createElement('div');
  grid.className = 'ind-grid';
  if (!open) grid.hidden = true;

  items.forEach(s => {
    const it = document.createElement('div');
    it.className = 'ind-item';
    it.innerHTML =
      '<div class="in"></div>' +
      '<div class="iu">/industries/' + s.slug + '/</div>';
    it.querySelector('.in').textContent = s.name;
    it.addEventListener('click', () => openSite(s.url));
    grid.appendChild(it);
  });

  toggle.addEventListener('click', () => {
    if (forceOpen) return;
    expanded[brandKey] = !expanded[brandKey];
    render();
  });

  block.appendChild(toggle);
  block.appendChild(grid);
  return block;
}

/* ============================================================
   Render
   ============================================================ */
function render() {
  $results.innerHTML = '';
  let shown = 0;

  BRAND_ORDER.forEach(bk => {
    const b = BRANDS[bk];
    const regular  = ALL.filter(s => s.brand === bk && s.cat !== 'industry' && catOk(s) && qOk(s));
    const industry = ALL.filter(s => s.brand === bk && s.cat === 'industry' && catOk(s) && qOk(s));
    if (!regular.length && !industry.length) return;

    shown += regular.length + industry.length;

    const sec = document.createElement('section');
    sec.className = 'brand-sec';

    const head = document.createElement('div');
    head.className = 'brand-head';
    head.style.background = b.color;
    head.style.color = b.ink;
    head.innerHTML =
      '<span class="brand-dot"></span>' +
      '<div><h2></h2><div class="tag"></div></div>' +
      '<span class="n">' + (regular.length + industry.length) + '</span>';
    head.querySelector('h2').textContent = b.name;
    head.querySelector('.tag').textContent = b.tagline;
    sec.appendChild(head);

    regular.forEach(s => sec.appendChild(makeCard(s)));
    if (industry.length) sec.appendChild(makeIndustryBlock(bk, industry));

    $results.appendChild(sec);
  });

  $empty.hidden = shown > 0;
  $results.hidden = shown === 0;
}

/* ============================================================
   Chips
   ============================================================ */
function buildChips() {
  $chips.innerHTML = '';
  CHIPS.forEach(c => {
    const count = c.key === 'all'
      ? ALL.length
      : ALL.filter(s => s.cat === c.key).length;
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.setAttribute('aria-pressed', String(c.key === activeCat));
    btn.innerHTML = c.label + '<span class="ct">' + count + '</span>';
    btn.addEventListener('click', () => {
      activeCat = c.key;
      buildChips();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $chips.appendChild(btn);
  });
}

/* ============================================================
   Search
   ============================================================ */
$search.addEventListener('input', () => {
  query = $search.value.trim().toLowerCase();
  $clear.hidden = !query;
  render();
});
$clear.addEventListener('click', () => {
  $search.value = '';
  query = '';
  $clear.hidden = true;
  $search.focus();
  render();
});

/* ============================================================
   Toast + copy
   ============================================================ */
let toastTimer;
function toast(msg) {
  $toast.textContent = msg;
  $toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $toast.hidden = true; }, 1900);
}
function copyLink(url) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(
      () => toast('Link copied'),
      () => fallbackCopy(url)
    );
  } else {
    fallbackCopy(url);
  }
}
function fallbackCopy(url) {
  const t = document.createElement('textarea');
  t.value = url;
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.appendChild(t);
  t.select();
  try { document.execCommand('copy'); toast('Link copied'); }
  catch (e) { toast('Copy failed'); }
  document.body.removeChild(t);
}

/* ============================================================
   Install (Android) + iOS hint
   ============================================================ */
let deferredPrompt = null;
const $installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  $installBtn.hidden = false;
});
$installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $installBtn.hidden = true;
});
window.addEventListener('appinstalled', () => { $installBtn.hidden = true; });

(function iosHint() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.navigator.standalone ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !standalone && !localStorage.getItem('tk_ios_hint')) {
    const el = document.getElementById('iosHint');
    el.hidden = false;
    document.getElementById('iosHintClose').addEventListener('click', () => {
      el.hidden = true;
      localStorage.setItem('tk_ios_hint', '1');
    });
  }
})();

/* ============================================================
   Boot
   ============================================================ */
buildChips();
render();
$foot.textContent = ALL.length + ' sites · updated ' + HUB.updated + ' · v' + HUB.version;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
