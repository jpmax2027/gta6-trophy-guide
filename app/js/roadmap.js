// roadmap.js — the ordered route to the platinum.
//
// Single job: define the roadmap stages (built from the official trophy
// descriptions) and render them. Story chapters and missions come first in
// official order, then stranger strands, activities, collectibles and
// exploration, crime and money, one-time secrets, and finally 100%
// completion into the platinum. Exposed as the global TrophyRoadmap.

const ROADMAP_STAGES = [
  {
    title: "Stage 1 — The Story: Chapters & Missions",
    note: "Play the campaign straight through first. Every chapter and named mission trophy below unlocks simply by finishing that part of the story, in official order. Do not chase collectibles yet — the map, vehicles and fast travel open up as you go, and story missions can be replayed from the pause menu if you ever need a specific moment again.",
    trophyIds: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 7],
  },
  {
    title: "Stage 2 — Stranger Strands",
    note: "With the story done, work through the strangers scattered across Leonida. Each strand is a short chain; the trophy lands on that person's final mission. Finishing any eight strands also completes the silver Strangers & Freaks trophy, so track the chains, not just the finales.",
    trophyIds: [22, 23, 24, 26, 27, 25],
  },
  {
    title: "Stage 3 — Activities & Challenges",
    note: "Sample everything once for Master of None, then settle into the grinds: shooting range golds, drone races, stunt jumps and the 50 challenges. These are all repeatable and none can be missed, so this stage is pure steady progress whenever you want a break from the map hunt.",
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 29, 32, 36, 51],
  },
  {
    title: "Stage 4 — Collectibles & Exploration",
    note: "Now sweep Leonida region by region: meditation spots, card sets, WAiNK locations, vehicle discoveries and full map exploration feed each other. Register vehicles to the Scooter Bros app as you find them so discovery and registration progress together instead of as two separate hunts.",
    trophyIds: [28, 30, 31, 35, 42, 55],
  },
  {
    title: "Stage 5 — Crime & Money",
    note: "The wanted-level and robbery trophies pair naturally: rob shops, vaults and armored trucks in planned sessions with an escape vehicle ready, and let the earnings flow into laundering, shop spending and the garage properties. Keep your partner with you for the two co-op-flavoured robbery trophies in this stage.",
    trophyIds: [33, 34, 39, 40, 41, 43, 52, 53, 54],
  },
  {
    title: "Stage 6 — Secrets & One-Time Moments",
    note: "The cryptic trophies live here — quiet scenes, odd encounters and the four missable-flagged trophies (Catch Me If You Can, Personal Best, Actions Speak Louder and Bad Luck, I Guess). Read each guide before triggering its moment: the missable flags are inferred from the official descriptions, and the safe move is to make a manual save before any one-time choice or departure.",
    trophyIds: [37, 38, 44, 45, 46, 47, 48, 49, 50],
  },
  {
    title: "Stage 7 — 100% & The Platinum",
    note: "Check the in-game 100% checklist: whatever remains from the earlier stages is all that stands between you and A Long Road. The moment 100% lands, the platinum — Vice Got a Price! — follows automatically once every other trophy is earned.",
    trophyIds: [14, 1],
  },
];

function stageProgressHtml(stage, trophiesById, state) {
  let earned = 0;
  for (const id of stage.trophyIds) {
    if (TrophyStore.isEarned(state, id)) {
      earned += 1;
    }
  }
  return earned + " / " + stage.trophyIds.length + " earned in this stage";
}

function roadmapStageHtml(stage, trophiesById, state) {
  const lines = [];
  lines.push('<section class="stage">');
  lines.push("<h3>" + TrophyRender.escapeHtml(stage.title) + "</h3>");
  lines.push('<p class="stage-note">' + TrophyRender.escapeHtml(stage.note) + "</p>");
  lines.push('<ul class="stage-list">');
  for (const id of stage.trophyIds) {
    const trophy = trophiesById.get(id);
    if (!trophy) {
      continue;
    }
    const earned = TrophyStore.isEarned(state, id);
    const label = TrophyRender.displayName(trophy, state) + (trophy.missable ? " ⚠ missable" : "");
    lines.push('<li><button type="button" data-open-detail="' + trophy.id + '" class="' + (earned ? "earned" : "") + '">' + TrophyRender.escapeHtml(label) + "</button></li>");
  }
  lines.push("</ul>");
  lines.push('<p class="stage-progress">' + stageProgressHtml(stage, trophiesById, state) + "</p>");
  lines.push("</section>");
  return lines.join("");
}

function renderRoadmap(container, trophies, state) {
  const trophiesById = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const html = ROADMAP_STAGES.map((stage) => roadmapStageHtml(stage, trophiesById, state)).join("");
  container.innerHTML = html;
}

const TrophyRoadmap = {
  ROADMAP_STAGES: ROADMAP_STAGES,
  renderRoadmap: renderRoadmap,
};
