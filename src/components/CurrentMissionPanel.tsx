import { missionHasStarted, missionStatusLabels } from "@/state/campaignState";
import { CheckCircle2, Clock3, PackageCheck, RadioTower, Wrench, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/state/GameState";

const statusLabels = missionStatusLabels;

export function CurrentMissionPanel() {
  const { selectedMission: mission, inventory, missionRun, startMission } = useGameState();
  const required = mission.supplyIds.map((id) => inventory.find((item) => item.id === id)).filter(Boolean);
  const completedObjectives = mission.objectives.filter((objective) => objective.complete).length;
  return (
    <aside data-mission-id={mission.id} data-mission-state={mission.state} className="game-panel flex min-h-0 flex-col overflow-hidden lg:h-full">
      <div className="panel-heading"><span className="eyebrow">Current mission</span><span className="text-[10px] uppercase text-[#82d9e7]">{statusLabels[mission.state]}</span></div>
      <div className="station-art relative h-28 shrink-0 overflow-hidden border-b border-[#c99a3d]/30">
        <div className="absolute bottom-4 left-7 h-9 w-24 -skew-x-6 border border-[#d7bd81]/50 bg-[#2b3d3a] shadow-xl" /><div className="absolute bottom-11 left-16 h-10 w-1 bg-[#d7bd81]/60" />
        <RadioTower className="absolute bottom-9 left-[51px] h-14 w-14 text-[#d9c98f]/70" strokeWidth={1.1} /><div className="absolute inset-x-0 bottom-0 h-7 bg-[#0d2529]/80" />
        <span className="absolute bottom-2 left-3 text-[9px] uppercase tracking-[.2em] text-white/65">{mission.location}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div><span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#c99a3d]">Mission {mission.number}</span><h1 className="font-display text-xl leading-tight text-[#fff2cf]">{mission.title}</h1></div>
          <span className="rounded border border-[#54cce8]/35 bg-[#54cce8]/10 px-2 py-1 text-[9px] font-bold uppercase text-[#8ee8f4]">{statusLabels[mission.state]}</span>
        </div>
        <p className="text-xs leading-relaxed text-[#cdd7d1]">{mission.objective}</p>
        <div className="mt-4 space-y-2.5 border-y border-white/10 py-3 text-[11px]">
          <div className="mission-detail"><Wrench /><span><b>Required skills</b>{mission.skills.join(", ")}</span></div>
          <div className="mission-detail"><Clock3 /><span><b>Estimated time</b>{mission.estimatedTime}</span></div>
          <div className="mission-detail"><PackageCheck /><span><b>Supplies needed</b>{required.map((item) => <em key={item!.id} className={`mr-2 inline-flex items-center gap-0.5 not-italic ${item!.packed ? "text-[#73d69d]" : "text-[#e2b563]"}`}>{item!.packed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{item!.name}</em>)}</span></div>
        </div>
        <div className="mt-4"><div className="mb-1.5 flex justify-between text-[9px] uppercase tracking-wider text-white/60"><span>Mission progress</span><span>{completedObjectives} / {mission.objectives.length} objectives</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#48c9e6] transition-all" style={{ width: `${mission.progress}%` }} /></div></div>
        <Button onClick={() => startMission()} className="mt-auto h-11 rounded-md border border-[#f0c96a]/70 bg-[#c99a3d] font-bold uppercase tracking-[.12em] text-[#142327] shadow-[inset_0_1px_rgba(255,255,255,.35),0_4px_15px_rgba(0,0,0,.3)] hover:bg-[#ddb45c]">{mission.state === "completed" ? "Review mission" : missionHasStarted(mission, missionRun) || mission.state === "active" ? "Continue mission" : "Start mission"}</Button>
      </div>
    </aside>
  );
}
