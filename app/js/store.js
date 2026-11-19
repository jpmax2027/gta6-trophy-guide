// store.js — progress persistence for the trophy tracker.
//
// Single job: own the player's state (which trophies are earned, and
// whether spoiler protection is on) and keep it in localStorage.
// Also handles export / import / reset of that state as a JSON file.
// Exposed as the global TrophyStore; no other module touches storage keys.

const STORAGE_KEY = "gta6-trophy-guide-v1";

const GRADE_POINTS = {
  bronze: 15,
  silver: 30,
  gold: 90,
  platinum: 300,
};

function defaultState() {
  return { earned: [], spoiler: false };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState();
    }
    const parsed = JSON.parse(raw);
    const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((id) => Number.isInteger(id)) : [];
    return { earned: earned, spoiler: parsed.spoiler === true };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, file quirks); the tracker
    // still works for the session, it just will not persist.
  }
}

function isEarned(state, trophyId) {
  return state.earned.includes(trophyId);
}

function toggleEarned(state, trophyId) {
  if (isEarned(state, trophyId)) {
    state.earned = state.earned.filter((id) => id !== trophyId);
  } else {
    state.earned = state.earned.concat([trophyId]);
  }
  saveState(state);
  return state;
}

function setSpoiler(state, on) {
  state.spoiler = on === true;
  saveState(state);
  return state;
}

function summarizeProgress(state, trophies) {
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let points = 0;
  for (const trophy of trophies) {
    totals[trophy.grade] = (totals[trophy.grade] ?? 0) + 1;
    if (isEarned(state, trophy.id)) {
      byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
      points += GRADE_POINTS[trophy.grade] ?? 0;
    }
  }
  const earnedCount = state.earned.filter((id) => trophies.some((t) => t.id === id)).length;
  const percent = trophies.length === 0 ? 0 : Math.round((earnedCount / trophies.length) * 100);
  return { earnedCount: earnedCount, total: trophies.length, percent: percent, points: points, byGrade: byGrade, totals: totals };
}

function exportProgress(state) {
  const payload = {
    app: "gta6-trophy-guide",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: state.earned.slice().sort((a, b) => a - b),
    spoiler: state.spoiler,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gta6-trophy-progress.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function importProgress(file, validIds) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.earned)) {
      throw new Error("That file does not look like an exported progress file.");
    }
    const earned = parsed.earned.filter((id) => Number.isInteger(id) && validIds.has(id));
    const state = { earned: earned, spoiler: parsed.spoiler === true };
    saveState(state);
    return state;
  });
}

function resetProgress() {
  const state = defaultState();
  saveState(state);
  return state;
}

const TrophyStore = {
  STORAGE_KEY: STORAGE_KEY,
  GRADE_POINTS: GRADE_POINTS,
  loadState: loadState,
  saveState: saveState,
  isEarned: isEarned,
  toggleEarned: toggleEarned,
  setSpoiler: setSpoiler,
  summarizeProgress: summarizeProgress,
  exportProgress: exportProgress,
  importProgress: importProgress,
  resetProgress: resetProgress,
};
