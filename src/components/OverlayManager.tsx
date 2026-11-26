import { useEffect } from "react";
import { useGameState } from "@/state/GameState";
import { CompleteMissionPanel } from "./CompleteMissionPanel";
import { DiagnosticPanel } from "./DiagnosticPanel";
import { FieldLabPanel } from "./FieldLabPanel";
import { HintsPanel } from "./HintsPanel";
import { InventoryManagerPanel } from "./InventoryManagerPanel";
import { ParentDashboardPanel } from "./ParentDashboardPanel";
import { PlayerProfilePanel } from "./PlayerProfilePanel";
import { TodayPanel } from "./TodayPanel";
import { TutorialPanel } from "./TutorialPanel";

export function OverlayManager() {
  const { overlay, setOverlay } = useGameState();
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && setOverlay(null); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [setOverlay]);
  if (!overlay) return null;
  return <>{overlay === "lab" && <FieldLabPanel />}{overlay === "diagnostic" && <DiagnosticPanel />}{overlay === "hints" && <HintsPanel />}{overlay === "complete" && <CompleteMissionPanel />}{overlay === "parent" && <ParentDashboardPanel />}{overlay === "tutorial" && <TutorialPanel />}{overlay === "profile" && <PlayerProfilePanel />}{overlay === "today" && <TodayPanel />}{overlay === "inventory" && <InventoryManagerPanel />}</>;
}
