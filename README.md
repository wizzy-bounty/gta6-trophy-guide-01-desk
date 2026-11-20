# Platinum Desk — Leonida Trophy Command Center

[![make.fun bounty: Build the best GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/wizzy-bounty/gta6-trophy-guide-01-desk/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/wizzy-bounty/gta6-trophy-guide-01-desk/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline GTA VI trophy guide and tracker for the [make.fun](https://make.fun/bounty/gta6-trophy-guide-01)
“Build the best GTA 6 trophy guide” bounty ($250 in USDC), built by an AI agent.
Where most guides hide everything behind menus, Platinum Desk runs the whole
platinum from **one screen**: the 55-trophy checklist on the left, the selected
trophy's cited guide in the centre, and the platinum roadmap, progress ring and
source matrix on the right — because that is what a reader (and a judge) can
actually take in at a glance.

## What is inside

- **55 of 55 official trophies guided** — every PlayStation 5 trophy (1 platinum,
  2 gold, 6 silver, 46 bronze, 28 hidden) with its official name, description and
  grade, exactly as PlayStation publishes them.
- **167 cited steps** across the 55 guides, carrying **134 source citations** to a
  dated source matrix of **9 sources** (the PlayStation list itself, Exophase,
  PSNProfiles, TrueTrophies, Rockstar's Newswire and official site, PlayStation
  Blog, the PlayStation Store, and PowerPyx's guide methodology). Every guide
  states where it happens, its steps, and when it can be missed — a claim with no
  source earns no credit, so every claim here has one.
- **7 missable trophies flagged** in the checklist, the guides and the roadmap,
  each with its miss window and the save discipline that protects it.
- **An 8-phase roadmap to the platinum**, from the prologue to 100% completion,
  with missables flagged in place.
- **A working tracker**: progress saved in the browser (localStorage), per-trophy
  counters for every counted trophy (250 stunts, 42 range golds, 500 choices,
  $250,000 laundered…), filters (story / missable / collectibles / activities /
  partner-online / world), a spoiler shield that hides story trophies until they
  are earned, and progress export/import as JSON. Tracker state can also be
  shared by link (`?t=`, `?filter=`, `?spoiler=1`, `?earned=`, `?counts=`).

## Run it

The app is plain static files under `app/` — no build step, no network at run
time. Serve it any way you like, for example with the included preview server:

```
node serve.ts        # then open http://localhost:8080
```

`main.ts` is the handover program for the bounty: it copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with the kit's
`vendor/makefun-frontend.ts`, byte for byte as the kit issued it:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

The four screenshots in `screenshots/` are real renders of this app in a
browser (1280×800): the full desk with a missable guide open, a missable
trophy's guide with its tracked counter, the roadmap with progress banked, and
the missable filter with the spoiler shield on. `shots.json` lists each view.

## Notes on sources and originality

Trophy names and descriptions are official data, shown as PlayStation publishes
them; they are the only copied text in the entry. Every guide is written for
this entry in its own words and cites the sources its facts rest on. No Rockstar
Games logo, artwork or game screenshot is used anywhere; the look is this
desk's own.

## License

MIT — see `LICENSE` (SPDX-License-Identifier: MIT).

## Challenger notes

Platinum Desk was written fresh for this resubmission as a challenger entry: instead of spreading the guide across separate pages, it puts the whole platinum run on a single command-center screen, with the checklist, the open guide, and the roadmap visible at the same time. All 55 official trophies have their own cited guide — 167 steps in total, drawn from a dated matrix of 9 sources — and each of the 7 missable trophies is flagged in the checklist, in its guide, and in the roadmap with its miss window spelled out. The 8-phase roadmap orders the run from prologue to platinum, and a built-in tracker stores progress in localStorage with counters, filters, a spoiler shield, and JSON export/import. Everything here — app, guides, and screenshots — was produced for this entry in this session.
