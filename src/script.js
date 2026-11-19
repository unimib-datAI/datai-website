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

function activateResearch(id, moveFocus = false) {
  selectResearch(id, moveFocus, true);
  window.history.replaceState(null, "", `#${id}`);
}

function selectResearchFromHash(animatePanel = false) {
  const anchor = document.getElementById(window.location.hash.slice(1));
  const panel = anchor?.closest("[data-research-panel]");
  if (!panel) return false;

  selectResearch(panel.dataset.researchPanel, false, animatePanel);
  anchor.scrollIntoView();
  return true;
}

researchControls.forEach((control, index) => {
  control.addEventListener("click", () => {
    activateResearch(control.dataset.researchControl);
  });
  control.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % researchControls.length;
    if (event.key === "ArrowUp") nextIndex = (index - 1 + researchControls.length) % researchControls.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = researchControls.length - 1;
    activateResearch(researchControls[nextIndex].dataset.researchControl, true);
  });
});

if (researchControls.length && researchPanels.length) {
  if (!selectResearchFromHash()) selectResearch("semantic");
  window.addEventListener("hashchange", () => selectResearchFromHash(true));
}

const publicationList = document.querySelector("[data-publication-list]");
const publicationRecords = Array.from(publicationList?.children ?? [], (item) => ({
  item,
  year: item.dataset.year,
  affiliates: item.dataset.affiliates.split(" "),
  search: normalized([
    item.querySelector(".publication-title").firstChild.textContent.trimEnd(),
    item.querySelector(".publication-authors").textContent,
    item.querySelector(".publication-venue")?.textContent,
    item.querySelector("a.publication-doi")?.getAttribute("href").slice("https://doi.org/".length),
    item.querySelector(".publication-meta > span").textContent,
    item.dataset.year,
  ].join(" ")),
}));
const publicationSearch = document.querySelector("[data-publication-search]");
const publicationYear = document.querySelector("[data-publication-year]");
const publicationMember = document.querySelector("[data-publication-member]");
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

function syncPublicationUrl() {
  if (!publicationRecords.length) return;
  const url = new URL(window.location.href);
  const query = publicationSearch?.value.trim() || "";
  const year = publicationYear?.value || "all";
  const member = publicationMember?.value || "all";

  if (query) url.searchParams.set("q", query);
  else url.searchParams.delete("q");
  if (year !== "all") url.searchParams.set("year", year);
  else url.searchParams.delete("year");
  if (member !== "all") url.searchParams.set("member", member);
  else url.searchParams.delete("member");

  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function updatePublications({ resetLimit = false } = {}) {
  if (!publicationRecords.length) return;
  if (resetLimit) publicationLimit = pageSize;

  const query = normalized(publicationSearch?.value || "");
  const year = publicationYear?.value || "all";
  const member = publicationMember?.value || "all";
  const matching = publicationRecords.filter((record) => {
    const matchesQuery = !query || record.search.includes(query);
    const matchesYear = year === "all" || record.year === year;
    const matchesMember = member === "all" || record.affiliates.includes(member);
    return matchesQuery && matchesYear && matchesMember;
  });

  const visibleItems = matching.slice(0, publicationLimit).map(({ item }) => item);
  publicationList.replaceChildren(...visibleItems);

  const visible = visibleItems.length;
  if (publicationStatus) {
    const selectedMember = member === "all" ? "" : publicationMember?.selectedOptions[0]?.textContent || "the selected member";
    const context = selectedMember ? ` by ${selectedMember}` : "";
    publicationStatus.textContent = matching.length
      ? `Showing ${visible} of ${matching.length} matching publications${context}.`
      : `No publications${context} match these filters.`;
  }
  if (publicationLoadMore) publicationLoadMore.hidden = visible >= matching.length;
  if (publicationClear) publicationClear.hidden = !query && year === "all" && member === "all";
}

publicationSearch?.addEventListener("input", () => {
  updatePublications({ resetLimit: true });
  syncPublicationUrl();
  schedulePublicationRetrace();
});
publicationYear?.addEventListener("change", () => {
  updatePublications({ resetLimit: true });
  syncPublicationUrl();
  schedulePublicationRetrace();
});
publicationMember?.addEventListener("change", () => {
  updatePublications({ resetLimit: true });
  syncPublicationUrl();
  schedulePublicationRetrace();
});
publicationLoadMore?.addEventListener("click", () => {
  publicationLimit += pageSize;
  updatePublications();
});
publicationClear?.addEventListener("click", () => {
  if (publicationSearch) publicationSearch.value = "";
  if (publicationYear) publicationYear.value = "all";
  if (publicationMember) publicationMember.value = "all";
  updatePublications({ resetLimit: true });
  syncPublicationUrl();
  schedulePublicationRetrace();
  publicationSearch?.focus();
});

if (publicationRecords.length) {
  const publicationParams = new URLSearchParams(window.location.search);
  const requestedYear = publicationParams.get("year");
  const requestedMember = publicationParams.get("member");
  if (publicationSearch) publicationSearch.value = publicationParams.get("q") || "";
  if (publicationYear && Array.from(publicationYear.options).some((option) => option.value === requestedYear)) {
    publicationYear.value = requestedYear;
  }
  if (publicationMember && Array.from(publicationMember.options).some((option) => option.value === requestedMember)) {
    publicationMember.value = requestedMember;
  }
}

updatePublications();

document.querySelectorAll("[data-mobile-nav] a").forEach((link) => {
  link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
});
