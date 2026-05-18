/* ============================================================
   Turnkey Services — Site Directory data
   ------------------------------------------------------------
   This is the ONLY file to edit when sites change.
   Add / remove / fix a row in SITES, or a slug in INDUSTRIES,
   and the app updates itself. No build step.
   ============================================================ */

const HUB = {
  version: '1.1.0',
  updated: 'May 18, 2026'
};

/* The 30 service-business verticals.
   Turnkey Web AND Turnkey AI both publish a page per slug
   at /industries/<slug>/. */
const INDUSTRIES = [
  'appliance-repair', 'auto-repair', 'barber-shop', 'concrete', 'day-spa',
  'electrician', 'fencing', 'flooring', 'garage-door', 'general-contractor',
  'gutter', 'hair-salon', 'handyman', 'house-cleaning', 'hvac',
  'junk-removal', 'landscaping', 'locksmith', 'med-spa', 'moving',
  'nail-salon', 'painting', 'pest-control', 'pet-grooming', 'plumber',
  'pool-service', 'pressure-washing', 'roofing', 'tree-service', 'window-cleaning'
];

/* Turnkey CFO's own niche / vertical landing pages.
   Different slug set + URL pattern from Web/AI — these live at
   turnkeycfo.com/<slug>/ (top-level, not /industries/). */
const CFO_INDUSTRIES = [
  { slug: 'auto-repair',         name: 'Auto Repair' },
  { slug: 'childcare',           name: 'Childcare' },
  { slug: 'cleaning',            name: 'Cleaning' },
  { slug: 'construction',        name: 'Construction' },
  { slug: 'consultants',         name: 'Consultants' },
  { slug: 'electricians',        name: 'Electricians' },
  { slug: 'fitness',             name: 'Fitness' },
  { slug: 'hairsalon',           name: 'Hair Salon' },
  { slug: 'hvac',                name: 'HVAC' },
  { slug: 'landscaping',         name: 'Landscaping' },
  { slug: 'medical',             name: 'Medical' },
  { slug: 'pestcontrol',         name: 'Pest Control' },
  { slug: 'plumbers',            name: 'Plumbers' },
  { slug: 'property-management', name: 'Property Management' },
  { slug: 'real-estate',         name: 'Real Estate' },
  { slug: 'restaurants',         name: 'Restaurants' },
  { slug: 'roofing',             name: 'Roofing' },
  { slug: 'treeservice',         name: 'Tree Service' },
  { slug: 'trucking',            name: 'Trucking' },
  { slug: 'veterinary',          name: 'Veterinary' }
];

/* Brand definitions — color + tagline per the Turnkey brand style guide.
   "product" and "client" are display groups, not brands. */
const BRANDS = {
  cfo:      { name: 'Turnkey CFO',      tagline: 'Financial clarity. Confident growth.',          color: '#00B050', ink: '#fff' },
  web:      { name: 'Turnkey Web',      tagline: 'Modern website. More traffic.',                 color: '#0055FF', ink: '#fff' },
  ai:       { name: 'Turnkey AI',       tagline: 'Intelligence. Automated. Impact.',              color: '#0098C7', ink: '#fff' },
  services: { name: 'Turnkey Services', tagline: 'One system. Every solution.',                   color: '#0A0A0A', ink: '#fff' },
  design:   { name: 'Turnkey Design',   tagline: 'Design that connects. Creativity that converts.',color: '#BD22A7', ink: '#fff' },
  seo:      { name: 'Turnkey SEO',      tagline: 'Rank higher. Grow faster.',                     color: '#FF1564', ink: '#fff' },
  partners: { name: 'Turnkey Partners', tagline: 'Stronger together. Built for lasting impact.',  color: '#B8920A', ink: '#fff' },
  product:  { name: 'Demos & Products', tagline: 'Live products, demos & internal tools.',        color: '#3D3D3D', ink: '#fff' },
  client:   { name: 'Client Showcase Sites', tagline: 'Built-for-prospect demo sites.',           color: '#6600CC', ink: '#fff' }
};

/* Render order of the sections. */
const BRAND_ORDER = ['cfo', 'web', 'ai', 'services', 'design', 'seo', 'partners', 'product', 'client'];

/* ------------------------------------------------------------
   SITES — every non-industry destination.
   cat:    hub | page | demo | client      (industry rows are generated)
   status: live | pending
   ------------------------------------------------------------ */
const SITES = [

  /* ---- Turnkey CFO ---- */
  { brand: 'cfo', cat: 'hub',  name: 'Turnkey CFO — Main Site', url: 'https://turnkeycfo.com', note: 'Flagship bookkeeping brand', status: 'live' },
  { brand: 'cfo', cat: 'page', name: 'Churches Vertical',       url: 'https://turnkeycfo.com/churches', note: 'Church bookkeeping landing page', status: 'live' },
  { brand: 'cfo', cat: 'page', name: 'Instant Estimate',        url: 'https://turnkeycfo.com/instant-estimate', note: 'Self-serve pricing tool', status: 'live' },
  { brand: 'cfo', cat: 'page', name: 'One-Pager',               url: 'https://turnkeycfo.com/one-pager', note: 'Single-page sales overview', status: 'live' },
  { brand: 'cfo', cat: 'page', name: 'Client Portal',           url: 'https://turnkeycfo.com/portal', note: 'Client-facing portal', status: 'live' },
  { brand: 'cfo', cat: 'page', name: 'Blog',                    url: 'https://turnkeycfo.com/blog/', note: 'Organic SEO articles', status: 'live' },

  /* ---- Turnkey Web ---- */
  { brand: 'web', cat: 'hub',  name: 'Turnkey Web — Main Site',  url: 'https://turnkeyweb.org', note: 'Website design & development', status: 'live' },
  { brand: 'web', cat: 'page', name: 'Portfolio',               url: 'https://turnkeyweb.org/portfolio', note: 'Work showcase', status: 'live' },
  { brand: 'web', cat: 'page', name: 'Intake Form',             url: 'https://turnkeyweb.org/intakeform', note: 'New-project intake (auto-submit)', status: 'live' },
  { brand: 'web', cat: 'page', name: 'One-Pager',               url: 'https://turnkeyweb.org/one-pager', note: 'Single-page sales overview', status: 'live' },
  { brand: 'web', cat: 'page', name: 'Blog',                    url: 'https://turnkeyweb.org/blog/', note: 'Organic SEO articles', status: 'live' },

  /* ---- Turnkey AI ---- */
  { brand: 'ai',  cat: 'hub',  name: 'Turnkey AI — Main Site',   url: 'https://turnkeyai.org', note: 'Practical AI for service businesses', status: 'live' },
  { brand: 'ai',  cat: 'page', name: 'Blog',                    url: 'https://turnkeyai.org/blog/', note: 'Organic SEO articles', status: 'live' },

  /* ---- Turnkey Services (parent) ---- */
  { brand: 'services', cat: 'hub', name: 'Turnkey Services — Main Site', url: 'https://turnkey-services.org', note: 'Parent / umbrella brand', status: 'live' },

  /* ---- Turnkey Design ---- */
  { brand: 'design', cat: 'page', name: 'Turnkey Design',       url: 'https://turnkey-services.org/design', note: 'Brand & UI/UX service page', status: 'live' },

  /* ---- Turnkey SEO ---- */
  { brand: 'seo', cat: 'page', name: 'Turnkey SEO',             url: 'https://turnkey-services.org/seo', note: 'SEO service page', status: 'live' },

  /* ---- Turnkey Partners ---- */
  { brand: 'partners', cat: 'page', name: 'Turnkey Partners',   url: 'https://turnkey-services.org/partners', note: 'Sacred Partner Program', status: 'live' },

  /* ---- Demos & Products ---- */
  { brand: 'product', cat: 'demo', name: 'Cortana Digest — Morning Brief', url: 'https://cortana-digest.pages.dev/morning-brief/', note: 'Daily HUD-style brief', status: 'live' },
  { brand: 'product', cat: 'demo', name: 'Echo Supply — Storefront Hub',   url: 'https://echo-supply-site.pages.dev/', note: 'Print-on-demand store hub', status: 'pending' },
  { brand: 'product', cat: 'demo', name: 'Faithful AI',                    url: '', note: 'Church agent platform — add live link', status: 'pending' },
  { brand: 'product', cat: 'demo', name: 'Hearth',                         url: '', note: 'AI cookbook platform — add live link', status: 'pending' },
  { brand: 'product', cat: 'demo', name: 'Flower Street Proposals',        url: '', note: 'Wedding-floral proposal portal — add live link', status: 'pending' },

  /* ---- Client Showcase Sites (prospect demo builds) ---- */
  { brand: 'client', cat: 'client', name: "Joe's Plumbing",       url: 'https://web-client-joes-plumbing.pages.dev/', note: 'Plumber · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'ATX Plumbing Co',      url: 'https://web-client-atx-plumbing-co.pages.dev/', note: 'Plumber · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Capital Electric ATX', url: 'https://turnkeycfo.github.io/web-client-capital-electric-atx/', note: 'Electrician · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Capital HVAC',         url: 'https://turnkeycfo.github.io/web-client-capital-hvac/', note: 'HVAC · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Summit Roofing ATX',   url: 'https://turnkeycfo.github.io/web-client-summit-roofing-atx/', note: 'Roofer · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Austin Tree Service',  url: 'https://turnkeycfo.github.io/web-client-austin-tree-service/', note: 'Tree service · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Texas Lawn Pros',      url: 'https://turnkeycfo.github.io/web-client-texas-lawn-pros/', note: 'Landscaping · Texas', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Lone Star Builders',   url: 'https://turnkeycfo.github.io/web-client-lone-star-builders/', note: 'General contractor · Texas', status: 'live' },
  { brand: 'client', cat: 'client', name: 'Luxe Hair Studio',     url: 'https://turnkeycfo.github.io/web-client-luxe-hair-studio/', note: 'Hair salon · Austin', status: 'live' },
  { brand: 'client', cat: 'client', name: 'The Nail Bar ATX',     url: 'https://turnkeycfo.github.io/web-client-the-nail-bar-atx/', note: 'Nail salon · Austin', status: 'live' }
];
