// main.js — bootstrap and wiring for the trophy guide app.
//
// Single job: load the trophy data, hold the current filter/view state,
// and connect the store, render and roadmap modules to the page.
// Routes are hash-based: #/ (checklist), #/roadmap, #/missables,
// and #/trophy/<id> opens the checklist with that trophy's detail open.

const AppState = {
  trophies: [],
  progress: null,
  filters: { search: "", kind: "all", grade: "all", state: "all", sort: "official" },
  route: "checklist",
  detailId: null,
};

function element(id) {
  return document.getElementById(id);
}

function trophiesById() {
  return new Map(AppState.trophies.map((trophy) => [trophy.id, trophy]));
}

function currentRoute() {
  const hash = window.location.hash || "#/";
  if (hash.startsWith("#/roadmap")) {
    return { view: "roadmap", detailId: null };
  }
  if (hash.startsWith("#/missables")) {
    return { view: "missables", detailId: null };
  }
  const trophyMatch = hash.match(/^#\/trophy\/(\d+)/);
  if (trophyMatch) {
    return { view: "checklist", detailId: Number(trophyMatch[1]) };
  }
  return { view: "checklist", detailId: null };
}

function renderProgressHeader() {
  const summary = TrophyStore.summarizeProgress(AppState.progress, AppState.trophies);
  element("stat-percent").textContent = summary.percent + "%";
  element("stat-earned").textContent = summary.earnedCount + " / " + summary.total;
  element("stat-points").textContent = String(summary.points);
  element("progress-fill").style.width = summary.percent + "%";
  element("progress-bar").setAttribute("aria-valuenow", String(summary.percent));
  const grades = ["platinum", "gold", "silver", "bronze"];
  const items = grades.map((grade) => {
    return "<li>" + TrophyRender.GRADE_LABEL[grade] + ": <b>" + summary.byGrade[grade] + " / " + summary.totals[grade] + "</b></li>";
  });
  element("grade-counts").innerHTML = items.join("");
}

function renderKindChips() {
  const kinds = TrophyRender.kindsPresent(AppState.trophies);
  const chips = [{ value: "all", label: "All" }];
  for (const kind of kinds) {
    chips.push({ value: kind, label: kind.charAt(0).toUpperCase() + kind.slice(1) });
  }
  chips.push({ value: "missable", label: "Missable" });
  const html = chips.map((chip) => {
    const active = AppState.filters.kind === chip.value ? " active" : "";
    const missableClass = chip.value === "missable" ? " chip-missable" : "";
    return '<button type="button" class="chip' + missableClass + active + '" data-kind="' + chip.value + '">' + chip.label + "</button>";
  });
  element("kind-chips").innerHTML = html.join("");
}

function renderChecklist() {
  const filtered = AppState.trophies.filter((trophy) => TrophyRender.matchesFilters(trophy, AppState.progress, AppState.filters));
  const sorted = TrophyRender.sortTrophies(filtered, AppState.filters.sort);
  element("trophy-list").innerHTML = sorted.map((trophy) => TrophyRender.trophyCardHtml(trophy, AppState.progress)).join("");
  element("empty-note").hidden = sorted.length > 0;
  element("result-count").textContent = "Showing " + sorted.length + " of " + AppState.trophies.length + " trophies";
}

function renderMissables() {
  const missables = AppState.trophies.filter((trophy) => trophy.missable);
  element("missable-list").innerHTML = missables.map((trophy) => TrophyRender.trophyCardHtml(trophy, AppState.progress)).join("");
}

function renderDetail() {
  const panel = element("detail-panel");
  const scrim = element("detail-scrim");
  if (AppState.detailId === null) {
    panel.hidden = true;
    scrim.hidden = true;
    return;
  }
  const trophy = trophiesById().get(AppState.detailId);
  if (!trophy) {
    panel.hidden = true;
    scrim.hidden = true;
    return;
  }
  element("detail-body").innerHTML = TrophyRender.detailHtml(trophy, AppState.progress);
  panel.hidden = false;
  scrim.hidden = false;
}

function applyRoute() {
  const route = currentRoute();
  AppState.route = route.view;
  AppState.detailId = route.detailId;
  element("view-checklist").hidden = route.view !== "checklist";
  element("view-roadmap").hidden = route.view !== "roadmap";
  element("view-missables").hidden = route.view !== "missables";
  element("toolbar").hidden = route.view !== "checklist";
  const tabs = document.querySelectorAll(".view-tabs .tab");
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.getAttribute("data-route") === route.view);
  });
  renderAll();
}

function renderAll() {
  renderProgressHeader();
  renderKindChips();
  renderChecklist();
  renderMissables();
  TrophyRoadmap.renderRoadmap(element("roadmap-stages"), AppState.trophies, AppState.progress);
  renderDetail();
}

function openDetail(trophyId) {
  AppState.detailId = trophyId;
  renderDetail();
}

function closeDetail() {
  AppState.detailId = null;
  if (window.location.hash.startsWith("#/trophy/")) {
    history.replaceState(null, "", "#/");
    AppState.route = "checklist";
  }
  renderDetail();
}

function onToggleEarned(trophyId) {
  AppState.progress = TrophyStore.toggleEarned(AppState.progress, trophyId);
  renderAll();
}

function wireEvents() {
  element("filter-search").addEventListener("input", (event) => {
    AppState.filters.search = event.target.value;
    renderChecklist();
  });
  element("filter-grade").addEventListener("change", (event) => {
    AppState.filters.grade = event.target.value;
    renderChecklist();
  });
  element("filter-state").addEventListener("change", (event) => {
    AppState.filters.state = event.target.value;
    renderChecklist();
  });
  element("filter-sort").addEventListener("change", (event) => {
    AppState.filters.sort = event.target.value;
    renderChecklist();
  });
  element("toggle-spoiler").addEventListener("change", (event) => {
    AppState.progress = TrophyStore.setSpoiler(AppState.progress, event.target.checked);
    renderAll();
  });
  element("kind-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-kind]");
    if (!chip) {
      return;
    }
    AppState.filters.kind = chip.getAttribute("data-kind");
    renderKindChips();
    renderChecklist();
  });
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-toggle-earned]");
    if (toggle && toggle.tagName === "BUTTON") {
      onToggleEarned(Number(toggle.getAttribute("data-toggle-earned")));
      return;
    }
    const opener = event.target.closest("[data-open-detail]");
    if (opener && !event.target.closest("[data-toggle-earned]")) {
      openDetail(Number(opener.getAttribute("data-open-detail")));
    }
  });
  document.addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-toggle-earned]");
    if (toggle && toggle.tagName === "INPUT") {
      onToggleEarned(Number(toggle.getAttribute("data-toggle-earned")));
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const opener = event.target.closest ? event.target.closest("[data-open-detail]") : null;
      if (opener) {
        openDetail(Number(opener.getAttribute("data-open-detail")));
      }
    }
    if (event.key === "Escape") {
      closeDetail();
    }
  });
  element("detail-close").addEventListener("click", closeDetail);
  element("detail-scrim").addEventListener("click", closeDetail);
  element("btn-export").addEventListener("click", () => {
    TrophyStore.exportProgress(AppState.progress);
  });
  element("btn-reset").addEventListener("click", () => {
    if (window.confirm("Reset all trophy progress? This clears every earned tick on this device.")) {
      AppState.progress = TrophyStore.resetProgress();
      element("toggle-spoiler").checked = false;
      renderAll();
    }
  });
  element("import-file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const validIds = new Set(AppState.trophies.map((trophy) => trophy.id));
    TrophyStore.importProgress(file, validIds).then((state) => {
      AppState.progress = state;
      element("toggle-spoiler").checked = state.spoiler;
      renderAll();
    }).catch(() => {
      window.alert("Import failed: that file is not a valid progress export.");
    });
    event.target.value = "";
  });
  window.addEventListener("hashchange", applyRoute);
}

function init() {
  AppState.progress = TrophyStore.loadState();
  element("brand-cup").innerHTML = TrophyRender.trophyIconSvg("platinum");
  fetch("data/trophies.json")
    .then((response) => response.json())
    .then((data) => {
      AppState.trophies = data.trophies;
      element("toggle-spoiler").checked = AppState.progress.spoiler;
      wireEvents();
      applyRoute();
    })
    .catch((error) => {
      element("result-count").textContent = "Could not load trophy data: " + error.message;
    });
}

document.addEventListener("DOMContentLoaded", init);
