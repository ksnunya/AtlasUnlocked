# Atlas Unlocked Content Development Guide

Use this guide to turn a learning objective into a playable expedition checkpoint. Atlas Unlocked is a playable work in progress. The current campaign has five missions and saves progress in the player's browser.

## Choose the right content path

| What you want to add | Where to start | What the current game supports |
| --- | --- | --- |
| A question, calculation, or simple field action | [campaignContent.ts](src/data/campaignContent.ts) and [gameData.ts](src/data/gameData.ts) | Ordered checkpoints with choice, numeric, or action input, hints, and existing supply, note, or relay requirements |
| A new linear mission | `initialMissions`, `campaignOrder`, and `campaignTasks` | Campaign progression, a mission marker, inventory review, and completion review |
| A Northwind reading, ASL, math, or science activity | [missionContent.ts](src/data/missionContent.ts), [missionMedia.ts](src/data/missionMedia.ts), and the matching component in [mission](src/components/mission) | A dedicated sequence with its own prerequisites, question data, station interactions, and ASL rounds |
| An external coursework reminder | `academyRequirements` and [AcademyWork.tsx](src/components/mission/AcademyWork.tsx) | An optional Northwind self-report checklist. The displayed total is currently fixed at five, so changing the count also requires a UI update. |
| A new interaction, region selector, reward, grade profile, or teacher report | The relevant component and state files below | Requires feature development and tests. The game has no curriculum editor, adaptive difficulty, rubric scoring, LMS integration, or cloud save. |

## Plan the learning content

1. Define a measurable outcome and decide what player evidence will show it. For example, a player can calculate a rectangle's area from given dimensions and label the result in square meters.
2. Pick a situation in which that skill matters. Put necessary evidence in the briefing, an accessible media alternative, or a prior checkpoint. Put the task itself in the prompt.
3. Record the intended grade band, prerequisite knowledge, reading level, standards source and version, expected response, and review date in an educator's planning record. The current game does not store these fields or filter missions by them.
4. Write plausible distractors and three levels of help. Give a small clue first, a direct explanation second, and worked reasoning last. Check the explanation independently of the stored answer.
5. Have a subject reviewer and a representative learner try the activity. Revise ambiguous wording and test the revised answer in the game.

| Subject | Exercise that fits the current game | Difficulty adjustments |
| --- | --- | --- |
| Mathematics | Calculate map distance, area, ratios, or a weather window | Change the numbers, unit conversions, or number of steps. State the expected unit and rounding in the prompt. |
| Science | Compare observations about insulation or choose a conclusion supported by measurements | Move from one-variable comparisons to comparing competing explanations. Label simulated observations. |
| Geography | Interpret a bearing, choose a route from contour information, or read a map scale | Start with cardinal directions, then introduce grid references and scale. Explain when a map is illustrative. |
| History | Compare short primary-source excerpts and choose a claim supported by their evidence | Add source context, conflicting accounts, or chronology. Record dates, provenance, and quotation permissions. |
| Language arts | Identify a main idea, infer a safe instruction, or interpret vocabulary in context | Adjust passage length and inference depth. Use the Notebook for writing practice with educator feedback. |
| Healthcare | Use a fictional clinic's supplied instructions to identify a label or compare health information sources | Add interpretation of supplied labels or fictional records. Use age-appropriate examples reviewed by a qualified educator and omit real patient data. |
| Financial literacy | Compare fictional expedition budgets or calculate a unit price | Add discounts, constraints, or trade-offs. State currency and rounding and check all totals. |
| Other subjects | Use a short discipline-specific source, calculation, decision, or observation | Add complexity in the evidence or reasoning before commissioning a new interaction type. |

For curriculum customization, change the prompt, supporting material, answer choices, units, and hints together. Keep separate teacher notes for the standard alignment and any manual rubric. For younger learners, prefer short passages, concrete quantities, and a worked example. For advanced learners, add more evidence or a second reasoning step. A Notebook entry can satisfy a presence check, but the game does not judge its reasoning or grade free-form writing. Separate selectable grade tracks or alternative answers with different scoring need code and a save-compatibility plan.

### Educator planning template

```text
Mission ID and objective ID:
Subject and grade band:
Learning objective and prerequisite skill:
Standard, jurisdiction, version, and authoritative source:
Briefing, evidence, and source credits:
Prompt, expected answer, units, and rounding:
Distractors and the misconception each represents:
Hint 1 (clue), hint 2 (explanation), hint 3 (worked reasoning):
Supplies, notebook evidence, and any other completion gate:
Media license, accessible alternative, and reviewer:
Verification cases and review date:
```

## Create a standard campaign mission

1. Add a typed `Mission` object to `initialMissions` in [gameData.ts](src/data/gameData.ts). Use a stable machine ID and a unique display number. Start an appended mission locked with zero progress and incomplete objectives. Reuse valid inventory IDs in `supplyIds`.
2. Add the same mission ID at the matching position in `campaignOrder` in [campaignContent.ts](src/data/campaignContent.ts). `loadCampaign()` creates runs from that array, while `unlockProgression()` uses the `initialMissions` array order. Keep both orders aligned. Appending a mission is the simplest way to preserve prerequisites for existing saves.
3. Add a nonempty `CampaignTask[]` at `campaignTasks[mission.id]`. Each task ID must match exactly one objective ID. Keep the objective and task order the same. `CampaignRoute` renders tasks in array order and `completeObjective()` also requires preceding mission objectives to be complete.
4. Set the task's `brief`, `prompt`, `kind`, `answer`, and `hints`. Supply unique `options` for a choice task. For a number task, store a numeric string. `correctTaskAnswer()` rejects blank answers and compares values using JavaScript `Number()`. It has no tolerance, unit parsing, or fraction parser. For an action task, `CampaignRoute` passes the configured answer automatically when the player clicks the action button. Use it for a confirmation with meaningful prerequisites.
5. Choose only the gates the exercise needs. `taskRequirement()` supports `needsNote`, `needsSupplies`, and `needsRelay`. All mission supplies must be available, packed, and have a positive quantity for final completion, even if an individual task has no supply gate.
6. Follow the mission through briefing, supply check, field route, checkpoints, and mission review. `completionBlocker()` checks objectives and supplies. `completeMission()` records 100% and unlocks the next mission. The completion panel displays objectives, notes, interactions, and attempts. A points, badge, or loot reward would need a new award rule, UI, persisted state, and a test that repeated completion cannot award it again.
7. Review campaign copy and test fixtures after expanding the mission count. `finishSelectedMission()` in [GameState.tsx](src/state/GameState.tsx) currently says “All five missions are finished,” and the tests and README name the current five. Update count-specific references as part of the future mission change.

### Standard mission and checkpoint template

The example is an unimplemented teaching sample. Add the first object to `initialMissions` in `gameData.ts`, append its ID to `campaignOrder`, and add the three tasks as the `supply-budget` entry in `campaignTasks` in `campaignContent.ts`.

```ts
const supplyBudgetMission: Mission = {
  id: "supply-budget",
  number: "07",
  title: "Plan the Supply Budget",
  location: "South Survey Shelter",
  nodeLabel: "Supply Shelter",
  nodeCode: "Locked",
  state: "locked",
  objective: "Choose and document a supply plan within a fictional budget.",
  skills: ["Financial literacy", "Addition", "Evidence"],
  estimatedTime: "15 minutes",
  supplyIds: ["notebook", "pencil"],
  progress: 0,
  objectives: [
    { id: "budget-total", text: "Calculate the combined cost", complete: false },
    { id: "budget-choice", text: "Choose an affordable plan", complete: false },
    { id: "budget-record", text: "Record the plan", complete: false },
  ],
  hints: ["Compare the total cost with the budget."],
  x: "46%",
  y: "77%",
};
```

```ts
const supplyBudgetTasks: CampaignTask[] = [
  {
    id: "budget-total",
    brief: "A notebook costs 4 credits and a box of pencils costs 3 credits.",
    prompt: "How many credits do the two items cost together?",
    kind: "number",
    answer: "7",
    hints: ["Include both items.", "Add the two prices.", "4 + 3 = 7 credits."],
  },
  {
    id: "budget-choice",
    brief: "You have 8 credits. The basic plan costs 7 and the deluxe plan costs 9.",
    prompt: "Which plan stays within the budget?",
    kind: "choice",
    options: ["Basic plan", "Deluxe plan"],
    answer: "Basic plan",
    hints: ["Check each price.", "The price must be at most 8.", "7 is below 8, so choose the basic plan."],
  },
  {
    id: "budget-record",
    brief: "Write the plan and its cost in a new Notebook entry.",
    prompt: "Confirm you recorded the plan and packed your supplies.",
    kind: "action",
    answer: "recorded",
    actionLabel: "Confirm recorded plan",
    needsNote: true,
    needsSupplies: true,
    hints: ["Open the in-mission Notebook.", "Record the plan and cost, then check Inventory.", "Save a new mission note and pack the required notebook and pencil."],
  },
];
```

### Modify Northwind deliberately

Northwind uses dedicated stages in [MissionFlow.tsx](src/components/mission/MissionFlow.tsx), rather than `campaignTasks`. Its optional Academy Work checklist does not gate completion. Use `missionBriefing` and `readingTask` with [ReadingTask.tsx](src/components/mission/ReadingTask.tsx), `aslRounds` with [AslClueTask.tsx](src/components/mission/AslClueTask.tsx), `areaTask` and `massTask` with [MathTask.tsx](src/components/mission/MathTask.tsx), and `stationSystems` and `scienceTask` with [ScienceTask.tsx](src/components/mission/ScienceTask.tsx). If you add a required checkpoint, review `northwindRequirements`, `northwindRequiredTasks`, `aslCheckpointComplete()`, `setMissionStage()`, and `completionBlocker()` together. Some station actions and task IDs are in the components themselves. Adding a row to a data array alone may leave stage transitions or completion checks out of sync.

## Add educational media

- **Video.** Put cleared clips under [public/video/mission-actions](public/video/mission-actions). Add a root-relative URL in [missionMedia.ts](src/data/missionMedia.ts), encoding spaces and reserved URL characters. Vite copies the public assets into the production build. A reference also needs a component that displays it. The current Base Camp clip is rendered by `CampaignRoute` only after checkpoint `b3` is complete.
- **ASL.** Northwind uses an `aslRounds` entry with `id`, `prompt`, `options`, and `answer`, with `video` on signing rounds. Keep the original IDs for existing rounds. Have a qualified ASL reviewer check the interpretation and capture the full signing space, including facial expressions. Obtain publishing permission and provide an equivalent accessible route where assessment design allows. The current missing-video message directs players to hints. There is no automatic transcription or separate ASL curriculum.
- **Images and audio.** Add rights-cleared files in suitable folders under `public/`, then render them in the activity component with an `img` or `audio` element. Meaningful images need descriptive alt text and complex charts need a nearby text or data equivalent. Narration needs a transcript. There are no image, audio, caption, or generic media fields in `CampaignTask`.
- **Interactive activities.** Use existing choice, numeric, and action tasks first. For simulations, drag-and-drop, or multi-part responses, add a component and explicitly define its validation, keyboard equivalent, persisted state, and completion evidence. [FieldLabPanel.tsx](src/components/FieldLabPanel.tsx) and the station interactions are examples of custom components.
- **Rights.** Record ownership, consent, source, and terms in [MEDIA-CREDITS.md](MEDIA-CREDITS.md). Preserve the original clips, credits, and [license](LICENSE). Confirm new media is cleared for the intended audience and distribution.

An example of markup for a custom activity component with a new instructional MP4 and its matching captions:

```tsx
<video controls playsInline preload="metadata" aria-label="Reading a route scale">
  <source src="/video/mission-actions/route-scale.mp4" type="video/mp4" />
  <track
    kind="captions"
    src="/video/mission-actions/route-scale.en.vtt"
    srcLang="en"
    label="English"
    default
  />
  Your browser does not support this video.
</video>
```

Provide the transcript as readable text next to the clip. This template requires the two named files and a component that renders the markup.

## Expand the expedition map

- Set a mission's `location`, `nodeLabel`, `x`, and `y` in [gameData.ts](src/data/gameData.ts). `MissionMap` passes percentages to [MissionNode.tsx](src/components/MissionNode.tsx), where `left` and `top` position the HTML button. A mission with `x: "46%"` and `y: "77%"` is placed 46% across and 77% down the map panel. Check marker labels, hit targets, and overlap on wide and narrow layouts.
- The geographic basemap in [MissionMap.tsx](src/components/MissionMap.tsx) uses a fixed OpenStreetMap center and Web Mercator tiles. The illustrated SVG terrain is underneath as a fallback. Current missions do not store latitude and longitude. To place a marker from a real location, first verify its longitude and latitude and project them with the same tile math as the basemap. For research or planning, keep the original coordinates separately. Exact geographic anchoring across viewport cropping and zoom requires moving marker projection into the shared map coordinate system.
- The cyan route and its dark backing path are SVG paths in the `0 0 1000 660` viewBox. Existing marker buttons and route geometry are separate. To extend a route, edit both paths and check the stop circles. The `zoom` state scales the SVG and the existing reset returns it to 100%. HTML marker positions stay in panel coordinates.
- For another expedition region, design region IDs, per-region center and scale, marker and route grouping, navigation, and campaign/save rules before changing code. The current map is a single view. Keep visible OpenStreetMap attribution for the online layer, fetch only the tiles needed to display the map, and use normal browser caching. Do not prefetch or package tiles from the standard service for offline use. See the [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/).

## Preserve progress and evidence

| System | Where to work | Behavior to preserve |
| --- | --- | --- |
| Campaign saves | [GameState.tsx](src/state/GameState.tsx) and [campaignState.ts](src/state/campaignState.ts) | Browser `localStorage` uses the existing legacy key and schema 3 snapshot. `loadCampaign()` merges stored missions and objectives by IDs and restores runs, including legacy Northwind data. Keep IDs stable and test both new and existing saves. |
| Answers and progression | `MissionRunState`, `recordAttempt()`, `completeObjective()`, `synchronizeCampaign()`, `completionBlocker()` | Runs store answers, attempt counts, completed task IDs, and position. Reordering tasks can change what a saved index points to. Plan an explicit migration when changing order or removing checkpoints. |
| Inventory | `initialInventory`, `Mission.supplyIds`, `suppliesReady()`, [SupplyCheck.tsx](src/components/mission/SupplyCheck.tsx), [InventoryManagerPanel.tsx](src/components/InventoryManagerPanel.tsx) | The save loader merges base items by ID and retains custom items. Physical and in-game items are distinct. Updating defaults may not change a saved item's earlier values. |
| Notebook | `FieldNote`, `addNote()`, `newMissionNote()`, [NotebookPanel.tsx](src/components/NotebookPanel.tsx) | Notes made while a mission is open can be tagged with its ID. A note gate checks for a new mission note against the run baseline. Preloaded notes and edits to an old note do not substitute for a new entry. |
| Field Lab | `CampaignState.lab`, `prepareRelay()`, `runLabExperiment()`, [FieldLabPanel.tsx](src/components/FieldLabPanel.tsx) | The existing relay can be prepared after Northwind and must be packed for Glacier Relay. The existing experiment can add a Notebook observation. Additional experiments or craftable items need explicit state and rules. |
| Review and reporting | [CompleteMissionPanel.tsx](src/components/CompleteMissionPanel.tsx), [ProgressPanel.tsx](src/components/ProgressPanel.tsx), [SkillsPanel.tsx](src/components/SkillsPanel.tsx) | The game displays expedition progress. Check any hard-coded display content separately when you add a subject. Attempt counts and completion are local gameplay evidence, not a standards grade or educator report. |

Keep coursework reminders and instructional copy separate from save identifiers. If content must replace something already earned, decide which prior evidence is equivalent, preserve completion where appropriate, and add a legacy-save fixture. Use a separate browser profile for manual testing and avoid resetting anyone's existing progress.

## Build accessible activities

- Follow the existing labeled buttons and radio groups, prompt-labeled numeric inputs, visible focus styling, and `role="status"` feedback. `MissionNode` exposes mission state in accessible labels and selection using `aria-current`. ASL text-question choices support Tab and arrow keys, with Enter to submit the selected answer. Test keyboard activation on other activities through their buttons.
- Use semantic headings, clear input labels, and explicit instructions. State units and valid formats in the prompt. Keep status, success, and error wording understandable without color. Verify focus order and keyboard access when opening and closing panels.
- Add captions for meaningful audio and transcripts or descriptions for visual-only instruction. Provide equivalent evidence for activities where learners cannot use the media or map. Avoid alternatives that disclose the answer unless that disclosure is part of the scaffold.
- Test reading order with a screen reader, text scaling, contrast, narrow layouts, magnification, and the game with the geographic tiles unavailable. Existing labels and controls are a starting point. Full assistive-technology coverage has yet to be verified.

## Test and review changes

From a fresh working copy with the supported Node version, install the locked dependencies and run:

```sh
npm ci
npm run typecheck
npm test
npm run lint
npm run build
node --test src/tests/production-server.test.mjs
```

- Extend [missions.test.mjs](src/tests/missions.test.mjs) when adding mission behavior. It mounts the app with JSDOM through [register.mjs](src/tests/register.mjs) and exercises player controls and saved data. Check wrong and blank answers, valid answers, requirement failures, hints, retries, final review, and next-mission unlock. Confirm attempts and reload behavior. For new state, test a legacy save and an in-progress save.
- Play the route in the browser with both a fresh profile and a test profile using an older save. Check map markers, route visibility, all zoom buttons, disconnected map behavior, inventory, Notebook, Field Lab, and resuming an unfinished checkpoint.
- After building, set `ATLAS_UNLOCKED_CHROME` to a Chromium executable and `ATLAS_UNLOCKED_FFMPEG` to an FFmpeg executable with libx264 support, then run [verify-media.mjs](scripts/verify-media.mjs) with `node scripts/verify-media.mjs`. The script targets the three shipped clips. Extend its expected inventory and checks if you add a clip. Also check captions, playback controls, media-failure messaging, and the production build in a real browser.
- Have the educator solve the questions independently and verify the facts, units, rounding, distractors, grade alignment, answer rationale, and source permissions. Pilot the sequence with learners before treating it as classroom-ready.
- Check the [README's testing limitations](README.md#outstanding-testing) before interpreting the results. The game remains a playable work in progress.

### Handoff for an AI coding assistant

Give the assistant the mission and objective IDs, the planning record, intended scope, source and rights information, and the expected test outcomes. Ask it to trace the relevant component and completion checks before editing, use existing task types where they fit, and flag any needed changes to persisted data. Review the diff for unrelated gameplay or branding changes, then test the activity from its normal map entry point.
