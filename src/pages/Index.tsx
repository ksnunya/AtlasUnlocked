import { X } from "lucide-react";
import { BottomControls } from "@/components/BottomControls";
import { CurrentMissionPanel } from "@/components/CurrentMissionPanel";
import { Header } from "@/components/Header";
import { InventoryPanel } from "@/components/InventoryPanel";
import { MissionList } from "@/components/MissionList";
import { MissionMap } from "@/components/MissionMap";
import { NotebookPanel } from "@/components/NotebookPanel";
import { OverlayManager } from "@/components/OverlayManager";
import { ProgressPanel } from "@/components/ProgressPanel";
import { SkillsPanel } from "@/components/SkillsPanel";
import { MissionFlow } from "@/components/mission/MissionFlow";
import { GameStateProvider, useGameState } from "@/state/GameState";

export function ExpeditionApp() {
  const { activeView, notice, clearNotice } = useGameState();
  return <div className="expedition-shell min-h-screen bg-[#06141a] text-[#edf0e8]">
    <Header />
    {activeView === "Map" ? <main className="map-layout grid gap-2 p-2 xl:h-[calc(100vh-150px)] xl:min-h-[610px] xl:grid-cols-[300px_minmax(520px,1fr)_330px]">
      <CurrentMissionPanel /><MissionMap /><div className="grid min-h-0 gap-2 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[auto_1fr]"><InventoryPanel /><NotebookPanel /></div>
    </main> : <main className="p-2 xl:min-h-[calc(100vh-150px)]">{activeView === "Missions" && <MissionList />}{activeView === "Skills" && <SkillsPanel />}{activeView === "Notebook" && <NotebookPanel expanded />}{activeView === "Progress" && <ProgressPanel />}</main>}
    <BottomControls />
    {notice && <div role="status" className="fixed left-1/2 top-24 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-[#c99a3d]/50 bg-[#0b252d]/95 px-4 py-3 text-xs text-[#f0dfb7] shadow-2xl backdrop-blur"><span>{notice}</span><button type="button" onClick={clearNotice} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}
    <MissionFlow />
    <OverlayManager />
  </div>;
}

const Index = () => <GameStateProvider><ExpeditionApp /></GameStateProvider>;
export default Index;
