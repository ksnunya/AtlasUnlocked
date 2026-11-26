# Atlas Unlocked

Atlas Unlocked is a browser-based expedition game about route planning, field observations, and solving practical problems. Start at Base Camp, use the map to open your next mission, and keep your supplies and observations organized in the Inventory, Notebook, and Field Lab.

## Development status

Atlas Unlocked is a playable work in progress and has not been fully tested. Future development includes character selection, mission improvements, and additional gameplay testing.

## Development and Technology

Atlas Unlocked is a custom coded game developed using source code, standard development tools, and AI assisted coding. It was not created using Base44 or similar no code app building platforms. The project maintains its own source code, assets, gameplay systems, and build configuration.

## Run locally

Clone the private repository with an authorized GitHub account or extract the source archive.

Use Node.js 24.15 or later in the Node 24 series and npm. From the repository folder:

```sh
npm ci
npm run dev
```

Open **http://localhost:8080**. Use the same browser profile and address for future sessions so the browser can find your save. The game uses browser storage and has no Python service, account, API key, or hosting requirement. The first dependency install needs registry access.

The Windows shell can use `npm.cmd` if PowerShell blocks `npm`. For a production preview, stop the dev server, run `npm run build`, then `npm run preview`. Both serve the same local address.

On Windows, build the game first, then use the optional launcher from PowerShell:

```powershell
powershell -File .\src\windows\AtlasUnlockedLauncher.ps1 -Action Start
powershell -File .\src\windows\AtlasUnlockedLauncher.ps1 -Action Stop
powershell -File .\src\windows\AtlasUnlockedLauncher.ps1 -Action Shortcut
```

The Shortcut action creates an Atlas Unlocked desktop shortcut for this checkout. Keep using the same browser profile and `http://localhost:8080` to continue a save from before the rename. The game still reads and writes the original browser storage key.

## Play the campaign

| Mission | Field work |
| --- | --- |
| 01 Establish Base Camp | Survey safe ground, calculate area, and pack camp supplies. |
| 02 Cross Cedar Pass | Plot a bearing, calculate distance, and choose a safe route. |
| 04 Restore the Field Research Station | Review supplies, interpret ASL clips, inspect the station, and complete the repair. |
| 05 Glacier Relay | Plan the ascent and weather window, prepare a relay, and calculate the signal ratio. |
| 06 Echo Canyon Survey | Pick a stable route, calculate the surveyed area, and record the route. |

Northwind includes a text-based question about offering help followed by two ASL videos. For the text question, use the mouse or Tab to the choices, arrow keys to move between them, and Enter to submit the selected answer. The round keeps its original save identifier so earlier completions still count.

## Mission videos

The three original videos are included in `public/video/mission-actions/`. The Base Camp action uses `make-a-fire.mp4`, and Northwind uses `Where are you from_.mp4` and `What's wrong_.mp4`. The checkout contains the game media needed to play. See [media credits](MEDIA-CREDITS.md) for public release review.

## Project layout

- `src/data/` defines missions, campaign content, and media paths.
- `src/components/`, `src/pages/`, and `src/state/` contain the player interface, mission interactions, and save logic.
- `src/tests/` contains campaign and Windows production-server tests. `src/windows/` contains the optional Windows launcher and loopback server.
- `public/` contains static browser assets. `scripts/verify-media.mjs` checks playback in a built copy.
- `package.json`, `package-lock.json`, and the root tool configuration define the dependencies and build. `npm run build` generates `dist/`.


## Verify a change

```sh
npm run typecheck
npm test
npm run lint
npm run build
```

The DOM tests exercise the campaign through player controls. After building with all three local clips, set `ATLAS_UNLOCKED_CHROME` to a Chromium-based browser and `ATLAS_UNLOCKED_FFMPEG` to FFmpeg with libx264 support. Run `node scripts/verify-media.mjs` to verify actual video playback and build output.

### Outstanding testing

A clean install through the supported Node 24 setup, a full manual campaign playthrough, keyboard and mouse behavior, save and reload across browsers, Windows shortcut behavior, and playback of all three mission videos still need end-to-end verification. Existing lint errors in two UI type declarations and the Tailwind configuration remain open. The Windows verification environment can block Node subprocesses used by npm install hooks, test isolation, and the production-server test.

## Licensing

Copyright © 2026 Kela Small. The [draft local-use license](LICENSE) proposes free downloads, installation, and local play for personal use, noncommercial education, and portfolio evaluation. Commercial use, resale, redistribution, and distribution of modified versions require Kela Small’s prior written permission. The draft grants no permissions pending her approval.

Kela Small’s three original video assets are separately copyrighted, with all rights reserved. Broader reuse requires her explicit permission. See [media credits](MEDIA-CREDITS.md) for asset details.

## Release checklist

- [ ] Install locked dependencies through an approved registry connection or a trusted offline cache. Run typecheck, tests, lint, and the production build.
- [ ] Confirm signer consent and review the third-party graphics in the three owner-created clips before any public release.
- [ ] Launch locally and complete all five missions. Verify keyboard and mouse controls, playback for all three clips, saved progress across reloads, and browser compatibility.
- [ ] Capture the expedition map and Northwind encounter from the verified local build.
- [ ] Obtain Kela Small’s approval of the proposed license and of publication. Review GitHub’s public repository terms, including its fork feature, before changing visibility.
