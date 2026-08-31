document.documentElement.classList.add("js-enhanced");

const researchControls = Array.from(document.querySelectorAll("[data-research-control]"));
const researchPanels = Array.from(document.querySelectorAll("[data-research-panel]"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function animateResearchPanel(panel) {
  if (!panel || reducedMotion.matches || typeof panel.animate !== "function") return;
  panel.getAnimations?.().forEach((animation) => animation.cancel());
  const meta = panel.querySelector("[data-research-meta]");
  const beam = meta?.querySelector(".research-panel-beam");
  const labels = meta ? Array.from(meta.children).filter((child) => child !== beam) : [];
  [meta, beam, ...labels].forEach((element) => element?.getAnimations?.().forEach((animation) => animation.cancel()));

  panel.animate(
    [
      { clipPath: "inset(0 0 100% 0)", opacity: 0.72 },
      { clipPath: "inset(0)", opacity: 1 },
    ],
    {
      duration: 380,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  );

  labels.forEach((label) => {
    label.animate(
      [
        { clipPath: "inset(49.5% 0)", filter: "blur(0.9px) brightness(2)", opacity: 0 },
        { clipPath: "inset(49.5% 0)", filter: "blur(0.6px) brightness(1.8)", opacity: 0.28, offset: 0.34 },
        { clipPath: "inset(0)", filter: "blur(0.15px) brightness(1.12)", opacity: 1, offset: 0.72 },
        { clipPath: "inset(0)", filter: "none", opacity: 1 },
      ],
      { duration: 380, easing: "linear" },
    );
  });

  beam?.animate(
    [
      { opacity: 0, transform: "scaleX(0.08)" },
      { opacity: 0.95, transform: "scaleX(0.28)", offset: 0.18 },
      { opacity: 0.82, transform: "scaleX(1)", offset: 0.52 },
      { opacity: 0, transform: "scaleX(1)" },
    ],
    { duration: 380, easing: "linear" },
  );
}

function selectResearch(id, moveFocus = false, animatePanel = false) {
  const previousPanel = researchPanels.find((panel) => !panel.hidden);
  let activePanel;
  researchControls.forEach((control) => {
    const selected = control.dataset.researchControl === id;
    control.setAttribute("aria-selected", String(selected));
    control.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) control.focus();
  });

  researchPanels.forEach((panel) => {
    const selected = panel.dataset.researchPanel === id;
    panel.hidden = !selected;
    panel.classList.toggle("is-active", selected);
    if (selected) activePanel = panel;
  });

  if (animatePanel && activePanel !== previousPanel) animateResearchPanel(activePanel);
}

researchControls.forEach((control, index) => {
  control.addEventListener("click", () => {
    const id = control.dataset.researchControl;
    selectResearch(id, false, true);
    window.history.replaceState(null, "", `#${id}`);
  });
  control.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % researchControls.length;
    if (event.key === "ArrowUp") nextIndex = (index - 1 + researchControls.length) % researchControls.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = researchControls.length - 1;
    selectResearch(researchControls[nextIndex].dataset.researchControl, true, true);
  });
});

if (researchControls.length && researchPanels.length) {
  const hashId = window.location.hash.slice(1);
  const initialResearch = researchControls.some((control) => control.dataset.researchControl === hashId)
    ? hashId
    : "semantic";
  selectResearch(initialResearch);

  window.addEventListener("hashchange", () => {
    const id = window.location.hash.slice(1);
    if (researchControls.some((control) => control.dataset.researchControl === id)) selectResearch(id, false, true);
  });
}

const publicationItems = Array.from(document.querySelectorAll("[data-publication-item]"));
const publicationSearch = document.querySelector("[data-publication-search]");
const publicationYear = document.querySelector("[data-publication-year]");
const publicationStatus = document.querySelector("[data-publication-status]");
const publicationLoadMore = document.querySelector("[data-publication-load-more]");
const publicationClear = document.querySelector("[data-publication-clear]");
const pageSize = 24;
let publicationLimit = pageSize;
let publicationRetraceTimer;

function schedulePublicationRetrace() {
  if (!publicationStatus || reducedMotion.matches) return;
  window.clearTimeout(publicationRetraceTimer);
  publicationRetraceTimer = window.setTimeout(() => {
    publicationStatus.classList.remove("is-retracing");
    void publicationStatus.offsetWidth;
    publicationStatus.classList.add("is-retracing");
  }, 80);
}

function normalized(value) {
  return value.trim().toLocaleLowerCase("en");
}

function updatePublications({ resetLimit = false } = {}) {
  if (!publicationItems.length) return;
  if (resetLimit) publicationLimit = pageSize;

  const query = normalized(publicationSearch?.value || "");
  const year = publicationYear?.value || "all";
  const matching = publicationItems.filter((item) => {
    const matchesQuery = !query || item.dataset.search.includes(query);
    const matchesYear = year === "all" || item.dataset.year === year;
    return matchesQuery && matchesYear;
  });

  publicationItems.forEach((item) => {
    const matchIndex = matching.indexOf(item);
    item.hidden = matchIndex < 0 || matchIndex >= publicationLimit;
  });

  const visible = Math.min(publicationLimit, matching.length);
  if (publicationStatus) {
    publicationStatus.textContent = matching.length
      ? `Showing ${visible} of ${matching.length} matching publications.`
      : "No publications match these filters.";
  }
  if (publicationLoadMore) publicationLoadMore.hidden = visible >= matching.length;
  if (publicationClear) publicationClear.hidden = !query && year === "all";
}

publicationSearch?.addEventListener("input", () => {
  updatePublications({ resetLimit: true });
  schedulePublicationRetrace();
});
publicationYear?.addEventListener("change", () => {
  updatePublications({ resetLimit: true });
  schedulePublicationRetrace();
});
publicationLoadMore?.addEventListener("click", () => {
  publicationLimit += pageSize;
  updatePublications();
});
publicationClear?.addEventListener("click", () => {
  if (publicationSearch) publicationSearch.value = "";
  if (publicationYear) publicationYear.value = "all";
  updatePublications({ resetLimit: true });
  schedulePublicationRetrace();
  publicationSearch?.focus();
});

updatePublications();

document.querySelectorAll("[data-mobile-nav] a").forEach((link) => {
  link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
});
