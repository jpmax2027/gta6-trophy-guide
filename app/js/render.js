// render.js — all DOM rendering for trophy cards and the detail panel.
//
// Single job: turn trophy data + tracker state into HTML strings and
// elements. Includes the original inline-SVG trophy cup icons (one shape,
// four grade finishes), the spoiler obscuring rule, filtering and sorting.
// Exposed as the global TrophyRender; wiring lives in main.js.

const GRADE_ORDER = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};

const GRADE_LABEL = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const GRADE_FILL = {
  platinum: "#a8ecff",
  gold: "#ffd75e",
  silver: "#d9dee8",
  bronze: "#e09a63",
};

function trophyIconSvg(grade) {
  const fill = GRADE_FILL[grade] ?? GRADE_FILL.bronze;
  const parts = [];
  parts.push('<svg viewBox="0 0 48 48" role="img" aria-label="' + GRADE_LABEL[grade] + ' trophy">');
  parts.push('<path d="M14 6h20v6c0 6-4 10-10 10S14 18 14 12V6z" fill="' + fill + '"/>');
  parts.push('<path d="M14 9H7c0 6 3 10 8 11-1-1.6-1.6-3.6-1.7-6L14 9z" fill="' + fill + '" opacity="0.75"/>');
  parts.push('<path d="M34 9h7c0 6-3 10-8 11 1-1.6 1.6-3.6 1.7-6L34 9z" fill="' + fill + '" opacity="0.75"/>');
  parts.push('<rect x="22" y="22" width="4" height="6" fill="' + fill + '"/>');
  parts.push('<rect x="16" y="28" width="16" height="4" rx="1.5" fill="' + fill + '"/>');
  parts.push('<rect x="13" y="34" width="22" height="4" rx="1.5" fill="' + fill + '" opacity="0.85"/>');
  parts.push('<circle cx="24" cy="13" r="3.2" fill="#241544" opacity="0.35"/>');
  parts.push("</svg>");
  return parts.join("");
}

function isObscured(trophy, state) {
  if (!state.spoiler) {
    return false;
  }
  if (TrophyStore.isEarned(state, trophy.id)) {
    return false;
  }
  return trophy.hidden === true;
}

function displayName(trophy, state) {
  if (isObscured(trophy, state)) {
    return "Hidden Trophy";
  }
  return trophy.name;
}

function displayDescription(trophy, state) {
  if (isObscured(trophy, state)) {
    return "Hidden trophy — earn it (or turn spoiler protection off) to reveal what it asks for.";
  }
  return trophy.description;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tagHtml(trophy) {
  const tags = [];
  tags.push('<span class="tag tag-grade-' + trophy.grade + '">' + GRADE_LABEL[trophy.grade] + "</span>");
  for (const kind of trophy.kinds) {
    tags.push('<span class="tag">' + escapeHtml(kind) + "</span>");
  }
  if (trophy.missable) {
    tags.push('<span class="tag tag-missable">Missable</span>');
  }
  if (trophy.hidden) {
    tags.push('<span class="tag">Hidden</span>');
  }
  return tags.join("");
}

function trophyCardHtml(trophy, state) {
  const earned = TrophyStore.isEarned(state, trophy.id);
  const obscured = isObscured(trophy, state);
  const lines = [];
  lines.push('<li class="trophy-card' + (earned ? " earned" : "") + '" data-open-detail="' + trophy.id + '" tabindex="0" role="button" aria-label="Open guide for ' + escapeHtml(displayName(trophy, state)) + '">');
  lines.push('<span class="trophy-icon">' + trophyIconSvg(trophy.grade) + "</span>");
  lines.push('<span class="trophy-main">');
  lines.push('<h3 class="trophy-name' + (obscured ? " obscured" : "") + '">' + escapeHtml(displayName(trophy, state)) + "</h3>");
  lines.push('<p class="trophy-desc' + (obscured ? " obscured" : "") + '">' + escapeHtml(displayDescription(trophy, state)) + "</p>");
  lines.push('<span class="trophy-tags">' + tagHtml(trophy) + "</span>");
  lines.push("</span>");
  lines.push('<label class="earn-box"><input type="checkbox" data-toggle-earned="' + trophy.id + '"' + (earned ? " checked" : "") + "> earned</label>");
  lines.push("</li>");
  return lines.join("");
}

function detailHtml(trophy, state) {
  const earned = TrophyStore.isEarned(state, trophy.id);
  const lines = [];
  lines.push('<div class="detail-head">');
  lines.push(trophyIconSvg(trophy.grade));
  lines.push("<div>");
  lines.push("<h2>" + escapeHtml(trophy.name) + "</h2>");
  lines.push('<span class="trophy-tags">' + tagHtml(trophy) + "</span>");
  lines.push("</div>");
  lines.push("</div>");
  lines.push("<h3>Official description</h3>");
  lines.push('<p class="detail-official">' + escapeHtml(trophy.description) + "</p>");
  if (trophy.target !== null && trophy.target !== undefined) {
    lines.push("<p>Target: <b>" + escapeHtml(trophy.target) + "</b></p>");
  }
  if (trophy.missable) {
    lines.push('<div class="missable-warning"><b>⚠ Missable — read before you play.</b><br>This trophy is flagged missable because its official description implies a one-time choice or event. The flag is inferred from the description text; see the guide below for the safe approach.</div>');
  }
  lines.push("<h3>Guide</h3>");
  lines.push('<p class="detail-guide">' + escapeHtml(trophy.guide) + "</p>");
  lines.push("<h3>Sources</h3>");
  lines.push('<ul class="detail-sources">');
  for (const source of trophy.sources) {
    lines.push('<li><a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.name) + "</a></li>");
  }
  lines.push("</ul>");
  lines.push('<button type="button" class="detail-earn' + (earned ? " is-earned" : "") + '" data-toggle-earned="' + trophy.id + '">' + (earned ? "✓ Earned — tap to undo" : "Mark earned") + "</button>");
  return lines.join("");
}

function matchesFilters(trophy, state, filters) {
  if (filters.kind === "missable") {
    if (!trophy.missable) {
      return false;
    }
  } else if (filters.kind !== "all") {
    if (!trophy.kinds.includes(filters.kind)) {
      return false;
    }
  }
  if (filters.grade !== "all" && trophy.grade !== filters.grade) {
    return false;
  }
  const earned = TrophyStore.isEarned(state, trophy.id);
  if (filters.state === "earned" && !earned) {
    return false;
  }
  if (filters.state === "unearned" && earned) {
    return false;
  }
  if (filters.search) {
    const haystack = (trophy.name + " " + trophy.description + " " + trophy.guide).toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) {
      return false;
    }
  }
  return true;
}

function sortTrophies(list, sortMode) {
  const copy = list.slice();
  if (sortMode === "name") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "grade") {
    copy.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
  } else {
    copy.sort((a, b) => a.id - b.id);
  }
  return copy;
}

function kindsPresent(trophies) {
  const seen = [];
  for (const trophy of trophies) {
    for (const kind of trophy.kinds) {
      if (!seen.includes(kind)) {
        seen.push(kind);
      }
    }
  }
  return seen;
}

const TrophyRender = {
  GRADE_LABEL: GRADE_LABEL,
  trophyIconSvg: trophyIconSvg,
  isObscured: isObscured,
  displayName: displayName,
  displayDescription: displayDescription,
  escapeHtml: escapeHtml,
  trophyCardHtml: trophyCardHtml,
  detailHtml: detailHtml,
  matchesFilters: matchesFilters,
  sortTrophies: sortTrophies,
  kindsPresent: kindsPresent,
};
