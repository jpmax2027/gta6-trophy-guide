# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jpmax2027/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jpmax2027/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Vice Got a Price! — a GTA VI trophy guide and platinum tracker.** This is a fully offline, static web app that covers all 55 PlayStation 5 trophies for Grand Theft Auto VI: the platinum, both golds, every silver and bronze, from the opening mission *Gone Fishing* to 100% completion. Open `app/index.html` from any static file server (or just run `node serve.ts`) and the whole guide works with the network switched off — there is no build step, no framework, no external font, image or script; every file the page loads lives under `app/`.

The tracker half is built for a real platinum run. Tick trophies off as you earn them and your progress is saved in the browser's local storage: a header shows percent complete, earned/total, total trophy points (bronze 15, silver 30, gold 90, platinum 300) and per-grade counts. Progress can be exported to a JSON file, imported back on another machine, or reset. Filters cover text search, kind (story, collectibles, activities, missables), grade and earned state, with sorting by official order, grade or name. A spoiler toggle hides the names and descriptions of unearned hidden trophies behind a "Hidden Trophy" placeholder, exactly like the PlayStation trophy list does, so you can track a blind first playthrough safely.

The guide half gives every trophy its own detail panel: the official description, grade and kind tags, a missable warning where one applies, an original step-by-step guide written for this app, and clickable sources. Two extra views sit on top of the checklist: a **Roadmap** that orders the run into stages — story chapters and missions first, then stranger strands, activities, collectibles and exploration, crime and money, and finally 100% into the platinum — with a short strategy note per stage and missables called out where they belong; and a **Missables** view that gathers the four trophies whose official descriptions imply a one-time choice or event, each with its warning. The look is an original dark, neon, Vice-City-inspired design built only from CSS gradients and hand-drawn inline SVG trophy cups — no game artwork, logos or screenshots are used anywhere.

The data in `app/data/trophies.json` was built from the official PlayStation trophy list for Grand Theft Auto VI (55 trophies, as published 2026-11-18): names, descriptions and grades are reproduced exactly, in official order. On top of that official layer, each trophy carries hand-authored metadata — hidden flag, kinds, missable flag, a numeric target where the description states one, an original guide, and sources. Cross-checks and guide research are cited per trophy from the community references listed in each trophy's sources, principally the PSNProfiles trophy guide (https://psnprofiles.com/guide/), the Exophase trophy list (https://www.exophase.com/game/), PowerPyx (https://www.powerpyx.com/), PlayStationTrophies.org (https://www.playstationtrophies.org/) and TrueTrophies (https://www.truetrophies.com/). Missable flags are deliberately conservative: they are only set where the official description itself implies a one-time choice or event, and the affected guides explain that story missions can be replayed from the pause menu, which is why no chapter trophy is flagged.

## Run it

```sh
node serve.ts          # try the guide at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in: copies app/ + screenshots/ and writes dossier.json
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=zbqpv30a&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
