import { BarChart3, CheckCircle2, Lightbulb, Lock, UsersRound } from "lucide-react";
import { useGameState } from "@/state/GameState";
import type { OverlayName } from "@/data/gameData";

const tones: Record<string, string> = { cyan: "text-[#75def1] border-[#41bdd5]/40", gold: "text-[#edc56f] border-[#c99a3d]/40", green: "text-[#78dba4] border-[#43bd78]/40", slate: "text-[#c1ccd0] border-white/15" };

export function BottomControls() {
  const { selectedMission, setOverlay } = useGameState();
  const completeCount = selectedMission.objectives.filter((item) => item.complete).length;
  const actions: { title: string; subtitle: string; icon: typeof BarChart3; tone: string; tag: string; overlay: OverlayName }[] = [
    { title: "Diagnostic", subtitle: "Calibrate your starting skills", icon: BarChart3, tone: "cyan", tag: "Optional", overlay: "diagnostic" },
    { title: "Hints & Explanations", subtitle: "Field guidance when you need it", icon: Lightbulb, tone: "gold", tag: "2 available", overlay: "hints" },
    { title: "Complete Mission", subtitle: "Review objectives and supplies", icon: CheckCircle2, tone: "green", tag: `${completeCount} / ${selectedMission.objectives.length} complete`, overlay: "complete" },
    { title: "Parent Dashboard", subtitle: "Expedition overview & progress", icon: UsersRound, tone: "slate", tag: "Local", overlay: "parent" },
  ];
  return <footer className="grid grid-cols-2 gap-2 border-t border-[#c99a3d]/45 bg-[#071820] p-2 lg:grid-cols-4">{actions.map(({ title, subtitle, icon: Icon, tone, tag, overlay }, i) => <button key={title} type="button" onClick={() => setOverlay(overlay)} className={`group flex min-h-[64px] items-center gap-3 rounded-lg border bg-[#0d242c] px-3 text-left transition hover:-translate-y-0.5 hover:bg-[#12313a] ${tones[tone]}`}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-current/30 bg-current/5"><Icon className="h-5 w-5" /></div><div className="min-w-0"><span className="block truncate text-[11px] font-bold uppercase tracking-[.08em] text-[#f1f1e8]">{title}</span><span className="hidden truncate text-[9px] text-white/45 sm:block">{subtitle}</span><span className="mt-1 flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider">{i === 3 && <Lock className="h-2.5 w-2.5" />}{tag}</span></div></button>)}</footer>;
}
