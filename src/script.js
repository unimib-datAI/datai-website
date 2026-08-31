document.documentElement.classList.add("js-enhanced");

const researchControls = Array.from(document.querySelectorAll("[data-research-control]"));
const researchPanels = Array.from(document.querySelectorAll("[data-research-panel]"));

function selectResearch(id, moveFocus = false) {
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
  });
}

researchControls.forEach((control, index) => {
  control.addEventListener("click", () => {
    const id = control.dataset.researchControl;
    selectResearch(id);
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
    selectResearch(researchControls[nextIndex].dataset.researchControl, true);
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
    if (researchControls.some((control) => control.dataset.researchControl === id)) selectResearch(id);
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

publicationSearch?.addEventListener("input", () => updatePublications({ resetLimit: true }));
publicationYear?.addEventListener("change", () => updatePublications({ resetLimit: true }));
publicationLoadMore?.addEventListener("click", () => {
  publicationLimit += pageSize;
  updatePublications();
});
publicationClear?.addEventListener("click", () => {
  if (publicationSearch) publicationSearch.value = "";
  if (publicationYear) publicationYear.value = "all";
  updatePublications({ resetLimit: true });
  publicationSearch?.focus();
});

updatePublications();

document.querySelectorAll("[data-mobile-nav] a").forEach((link) => {
  link.addEventListener("click", () => link.closest("details")?.removeAttribute("open"));
});
