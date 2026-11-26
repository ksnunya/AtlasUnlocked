# Atlas Unlocked

Atlas Unlocked is a browser-based expedition game about route planning, field observations, and solving practical problems. Start at Base Camp, use the map to open your next mission, and keep your supplies and observations organized in the Inventory, Notebook, and Field Lab.

**Developing educational content?** Start with the [Content Development Guide](CONTENT-DEVELOPMENT.md).

## Development status

Version **0.1.0** is an early development release candidate.

Atlas Unlocked is a playable work in progress and has not been fully tested. Future development includes character selection, mission improvements, and additional gameplay testing.

## Development and Technology

Atlas Unlocked is a custom coded game developed using standard development tools and AI assisted coding, primarily through ChatGPT and Codex, with limited use of Dyad during development. The game runs independently without requiring Dyad, Base44, or a proprietary app building platform. The project maintains its own source code, assets, gameplay systems, and build configuration.

## Run locally

Clone the repository (with an authorized GitHub account if private) or extract the source archive.

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

The Shortcut action creates an Atlas Unlocked desktop shortcut for this checkout. The Windows launcher opens the game in the installed Google Chrome using its normal profile. Keep using the same browser profile and `http://localhost:8080` to continue a save from before the rename. The game still reads and writes the original browser storage key.

### Windows shortcut limitation

On some Windows setups, the shortcut can trigger a Chrome application error (0x80000003). The manual launch path uses the same game address and Chrome profile. Build the game, then start the loopback server from the project folder and leave the terminal open:

```powershell
npm.cmd run build
node .\src\windows\AtlasUnlockedServer.mjs
```

If Atlas Unlocked already responds at port 8080, use the running server. In an existing Chrome window, enter **http://localhost:8080**. This avoids the shortcut's browser launch step. If Vite's default config loader cannot start its subprocess in a restricted Windows session, run `npm run build -- --configLoader native` with the supported Node 24 release.

## Play the campaign

| Mission | Field work |
| --- | --- |
| 01 Establish Base Camp | Survey safe ground, calculate area, and pack camp supplies. |
| 02 Cross Cedar Pass | Plot a bearing, calculate distance, and choose a safe route. |
| 04 Restore the Field Research Station | Review supplies, interpret ASL clips, inspect the station, and complete the repair. |
| 05 Glacier Relay | Plan the ascent and weather window, prepare a relay, and calculate the signal ratio. |
| 06 Echo Canyon Survey | Pick a stable route, calculate the surveyed area, and record the route. |

Northwind includes a text-based question about offering help followed by two ASL videos. For the text question, use the mouse or Tab to the choices, arrow keys to move between them, and Enter to submit the selected answer. The round keeps its original save identifier so earlier completions still count.

A new player starts at Base Camp with an empty Notebook and the default supplies. The Parent Dashboard shows saved expedition activity and self-reported Academy Work. The game does not track playtime or report grades, achievements, or subject mastery.

When connected, the expedition map shows live OpenStreetMap tiles with visible attribution. The original illustrated terrain remains available offline. The project does not bundle tiles. See [OpenStreetMap attribution](https://www.openstreetmap.org/copyright) and the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

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

Clean installation on Node 24, a full manual browser playthrough, cross-browser save and reload behavior, desktop shortcut launch, and in-browser playback of all three clips remain release checks. Type checking and lint pass in the available environment, with existing Fast Refresh warnings. A Windows restriction can block the default Vite config loader, npm install hooks, and subprocess-based test runners.

The npm advisory service was unreachable during release verification. The locked Vite development server should remain loopback-only, as configured. Upstream identifies a patch for [GHSA-p4f5-76q4-ffq7](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7), which applies when affected development servers are exposed to the network.

## Licensing

Copyright © 2026 Kela Small. The [local-use license](LICENSE) permits free downloads, installation, and local play for personal use, noncommercial education, and portfolio evaluation. Commercial use, resale, redistribution, and distribution of modified versions require Kela Small’s prior written permission.

Kela Small’s three original video assets are separately copyrighted, with all rights reserved. Broader reuse requires her explicit permission. See [media credits](MEDIA-CREDITS.md) for asset details.

Third-party software notices are included in the [source](THIRD-PARTY-NOTICES.txt) and generated production build.

## Release checklist

- [x] Adopt the owner-approved local-use license and document development credits.
- [x] Record shipped software notices and map attribution.
- [ ] Complete an online dependency audit and verify the Vite patch on Node 24.
- [ ] Confirm signer consent and clear embedded graphics for public GitHub and portfolio distribution.
- [ ] Verify all five missions and the three videos in a supported browser from a clean checkout.
- [ ] Capture approved promotional screenshots from a fresh browser profile.
- [ ] Obtain publication approval after the security and media rights checks are cleared.
