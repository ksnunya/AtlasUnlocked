import { missionStatusLabels } from "@/state/campaignState";
import { useState } from "react";
import { Crosshair, Layers3, LocateFixed, Minus, Plus, Wind } from "lucide-react";
import { MissionNode } from "./MissionNode";
import { useGameState } from "@/state/GameState";

// Match the OpenStreetMap center and scale in the archived expedition map.
const mapCenter = { longitude: -21.93, latitude: 64.125 };
const originalMapZoom = 9.8;
const tileZoom = 11;
const tileCount = 2 ** tileZoom;
const tileSize = 512 * 2 ** originalMapZoom / tileCount;
const centerTileX = (mapCenter.longitude + 180) / 360 * tileCount;
const latitudeRadians = mapCenter.latitude * Math.PI / 180;
const centerTileY = (1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2 * tileCount;
const mapLeft = centerTileX - 500 / tileSize;
const mapTop = centerTileY - 330 / tileSize;
const mapTiles = [];

for (let row = Math.floor(mapTop); row < mapTop + 660 / tileSize; row++) {
  for (let column = Math.floor(mapLeft); column < mapLeft + 1000 / tileSize; column++) {
    mapTiles.push({
      href: `https://tile.openstreetmap.org/${tileZoom}/${column}/${row}.png`,
      x: (column - mapLeft) * tileSize,
      y: (row - mapTop) * tileSize,
    });
  }
}

export function MissionMap() {
  const { missions, selectedMission, selectMission, startMission, setOverlay } = useGameState();
  const [zoom, setZoom] = useState(1);
  return (
    <section className="mission-map relative min-h-[460px] overflow-hidden border border-[#c99a3d]/45 bg-[#38554b] shadow-[inset_0_0_40px_rgba(4,20,24,.6)] lg:h-full lg:min-h-0">
      <svg className="absolute inset-0 h-full w-full transition-transform duration-200" style={{ transform: `scale(${zoom})` }} viewBox="0 0 1000 660" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="8"/><feBlend mode="soft-light" in="SourceGraphic"/></filter>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#f8eccb" strokeOpacity=".09" strokeWidth="1"/></pattern>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#314c42"/><stop offset=".5" stopColor="#677057"/><stop offset="1" stopColor="#7e6a48"/></linearGradient>
        </defs>
        <rect width="1000" height="660" fill="url(#land)"/>
        <path d="M0 30L80 10l70 82 85-62 90 62 64-35 96 92-105 50-88-8-80 65-100-29L0 270Z" fill="#314841" opacity=".9"/>
        <path d="M0 510c120-95 205-85 295-28 85 53 175 70 252 38 110-46 195-17 290 69l163 71H0Z" fill="#8a704d" opacity=".72"/>
        <path d="M650-20c-70 110-80 190-27 267 47 68 58 126 14 188-39 55-27 119 39 225h210c-87-96-112-170-74-222 44-61 26-134-30-197-70-79-45-164 23-261Z" fill="#2c6670" opacity=".9"/>
        <path d="M690-20c-62 118-35 182 24 246 57 61 77 136 28 209-37 55-15 131 71 225" fill="none" stroke="#9ed9cb" strokeOpacity=".55" strokeWidth="13"/>
        <g fill="none" stroke="#e8deb9" strokeOpacity=".16" strokeWidth="2">
          <path d="M-20 115c130-75 210-60 320 12s206 63 312-18 222-62 410 28"/><path d="M-30 146c130-75 225-55 329 14s200 69 312-9 236-59 423 31"/><path d="M-35 180c145-76 236-46 335 23s195 71 309 2 246-62 430 20"/>
          <path d="M-30 420c120-80 211-78 316-15s195 78 302 25 241-45 432 54"/><path d="M-25 451c120-80 217-75 322-12s193 75 299 25 236-39 424 53"/><path d="M-20 485c123-82 222-70 326-8s188 66 300 21 230-31 414 51"/>
        </g>
        <g fill="#183a34" opacity=".55">
          {Array.from({ length: 45 }).map((_, i) => <path key={i} d={`M${70 + (i * 83) % 800} ${210 + (i * 47) % 230}l8-18 8 18h-5l7 14H68l7-14Z`} />)}
        </g>
        <rect width="1000" height="660" filter="url(#rough)" opacity=".18"/>
        {mapTiles.map(({ href, x, y }) => (
          <image key={href} href={href} x={x} y={y} width={tileSize} height={tileSize} />
        ))}
        <rect width="1000" height="660" fill="url(#grid)"/>
        <path d="M125 460C230 420 272 350 365 377S490 330 575 295s113-5 167-77 88-62 142-90" fill="none" stroke="#07181f" strokeOpacity=".75" strokeWidth="10" strokeLinecap="round" strokeDasharray="2 16"/>
        <path d="M125 460C230 420 272 350 365 377S490 330 575 295s113-5 167-77 88-62 142-90" fill="none" stroke="#6fe0f2" strokeWidth="4" strokeLinecap="round"/>
        <g fill="#bdeef5">{[0,1,2,3,4].map(i => <circle key={i} cx={265+i*115} cy={385-i*48} r="4" />)}</g>
      </svg>

      <div className="absolute left-4 top-4 rounded border border-white/20 bg-[#071820]/85 px-3 py-2 backdrop-blur-sm">
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#c99a3d]">Alder Reach Territory</p>
        <p className="font-display text-base text-white">Northern Expedition Map</p>
      </div>

      <div className="absolute left-3 top-24 z-20 flex flex-col gap-1 rounded-md border border-white/15 bg-[#081b22]/90 p-1 text-white/80">
        <button type="button" onClick={() => setZoom((value) => Math.min(1.2, value + 0.1))} aria-label="Zoom in" className="grid h-8 w-8 place-items-center rounded hover:bg-white/10"><Plus className="h-4 w-4" /></button>
        <button type="button" onClick={() => setZoom((value) => Math.max(0.9, value - 0.1))} aria-label="Zoom out" className="grid h-8 w-8 place-items-center rounded hover:bg-white/10"><Minus className="h-4 w-4" /></button>
        <button type="button" onClick={() => setZoom(1)} aria-label="Reset map view" className="grid h-8 w-8 place-items-center rounded hover:bg-white/10"><LocateFixed className="h-4 w-4" /></button>
        <span className="text-center text-[7px] text-white/45">{Math.round(zoom * 100)}%</span>
      </div>

      {missions.map((mission) => (
        <MissionNode key={mission.id} x={mission.x} y={mission.y} label={mission.title} code={`Mission ${mission.number} ? ${missionStatusLabels[mission.state]}`} ariaLabel={`${mission.nodeLabel}, ${mission.state}`} missionId={mission.id} location={mission.location} objectiveCount={`${mission.objectives.filter((objective) => objective.complete).length}/${mission.objectives.length} objectives`} state={mission.state} selected={selectedMission.id === mission.id} onClick={() => startMission(mission.id)} />
      ))}
      <MissionNode x="74%" y="28%" label="FIELD LAB" code="Return Anytime" state="lab" onClick={() => setOverlay("lab")} />

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded border border-white/15 bg-[#081b22]/85 px-3 py-2 text-[9px] uppercase tracking-wider text-white/60 backdrop-blur-sm"><Wind className="h-4 w-4 text-[#8cd9e4]" /><span>Wind: NW 18 km/h<br/><b className="text-white/80">Visibility: Good</b></span></div>
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="absolute bottom-0 right-0 z-20 bg-[#081b22] px-1 text-[9px] text-white underline">
        ? OpenStreetMap contributors
      </a>
      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded border border-white/15 bg-[#081b22]/85 p-2 backdrop-blur-sm">
        <Crosshair className="h-5 w-5 text-[#e0bc6e]" /><div><p className="text-[8px] uppercase tracking-wider text-white/45">Map scale</p><p className="text-[10px] font-semibold text-white">1 square = 2 km</p></div><Layers3 className="ml-2 h-5 w-5 text-white/55" />
      </div>
    </section>
  );
}
