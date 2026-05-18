function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function computeSeoEstimate(payload) {
  const baseMap = {
    starter: { low: 700, high: 950, setup: 400 },
    growth: { low: 1400, high: 2200, setup: 750 },
    authority: { low: 2800, high: 4200, setup: 1200 }
  };

  const footprintAdjustments = {
    single: { low: 0, high: 0, setup: 0 },
    multicity: { low: 300, high: 600, setup: 250 },
    multilocation: { low: 900, high: 1600, setup: 500 }
  };

  const addOnMap = {
    gbp: { low: 250, high: 450, setup: 250, label: "GBP optimization" },
    reviews: { low: 150, high: 350, setup: 0, label: "Review management" },
    content: { low: 300, high: 700, setup: 0, label: "Content support" },
    tracking: { low: 100, high: 250, setup: 200, label: "Reporting + tracking stack" }
  };

  const contractAdjustments = payload.timeline === "priority"
    ? { low: 200, high: 300, setup: 0 }
    : { low: 0, high: 0, setup: 0 };

  const websiteAdjustments = payload.website === "needs-work"
    ? { low: 250, high: 500, setup: 450 }
    : payload.website === "rebuild"
      ? { low: 500, high: 900, setup: 900 }
      : { low: 0, high: 0, setup: 0 };

  let low = baseMap[payload.package].low + footprintAdjustments[payload.footprint].low + contractAdjustments.low + websiteAdjustments.low;
  let high = baseMap[payload.package].high + footprintAdjustments[payload.footprint].high + contractAdjustments.high + websiteAdjustments.high;
  let setup = baseMap[payload.package].setup + footprintAdjustments[payload.footprint].setup + websiteAdjustments.setup;

  const addOns = [];
  payload.addOns.forEach((key) => {
    const addOn = addOnMap[key];
    if (!addOn) {
      return;
    }
    low += addOn.low;
    high += addOn.high;
    setup += addOn.setup;
    addOns.push(addOn.label);
  });

  const packageLabels = {
    starter: "Starter Local Visibility",
    growth: "Growth Local SEO",
    authority: "Authority Search System"
  };

  return {
    low,
    high,
    setup,
    packageLabel: packageLabels[payload.package],
    summary: addOns.length ? addOns.join(", ") : "Core SEO scope only",
    nextStep: payload.package === "authority" ? "Audit review + roadmap call" : "Local SEO fit call"
  };
}

function bindSeoEstimator() {
  const form = document.querySelector("[data-seo-estimator]");
  if (!form) {
    return;
  }

  const output = {
    range: document.getElementById("estimate-range"),
    package: document.getElementById("estimate-package"),
    summary: document.getElementById("estimate-summary"),
    nextStep: document.getElementById("estimate-next-step"),
    setup: document.getElementById("estimate-setup")
  };

  const readPayload = () => ({
    package: form.package.value,
    footprint: form.footprint.value,
    timeline: form.timeline.value,
    website: form.website.value,
    addOns: Array.from(form.querySelectorAll('input[name="addons"]:checked')).map((item) => item.value)
  });

  const render = () => {
    const estimate = computeSeoEstimate(readPayload());
    output.range.textContent = `${formatCurrency(estimate.low)} - ${formatCurrency(estimate.high)}/mo`;
    output.package.textContent = estimate.packageLabel;
    output.summary.textContent = estimate.summary;
    output.nextStep.textContent = estimate.nextStep;
    output.setup.textContent = formatCurrency(estimate.setup);
  };

  form.addEventListener("input", render);
  render();
}

function bindPointerGlow() {
  const cards = document.querySelectorAll(".glow-card");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
    });
  });
}

function bindReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach((item) => observer.observe(item));
}

bindSeoEstimator();
bindPointerGlow();
bindReveals();
