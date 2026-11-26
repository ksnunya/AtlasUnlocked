import { missionStatusLabels } from "@/state/campaignState";
import { CheckCircle2, Clock3, LockKeyhole, MapPin, RadioTower } from "lucide-react";
import { useGameState } from "@/state/GameState";

const stateIcon = { completed: CheckCircle2, active: RadioTower, available: MapPin, locked: LockKeyhole };

export function MissionList() {
  const { missions, selectedMission, selectMission } = useGameState();
  return (
    <section className="content-panel game-panel">
      <div className="panel-heading"><span className="eyebrow">Mission ledger</span><span className="text-[9px] uppercase tracking-wider text-white/45">Alder Reach territory</span></div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {missions.map((mission) => {
          const Icon = stateIcon[mission.state];
          return <button key={mission.id} type="button" onClick={() => selectMission(mission.id)} className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[.05] ${selectedMission.id === mission.id ? "border-[#63d7ef] bg-[#3cc9e5]/10" : "border-[#c99a3d]/30 bg-[#0a2027]"}`}>
            <div className="mb-3 flex items-start justify-between"><div className={`grid h-9 w-9 place-items-center rounded-full border ${mission.state === "locked" ? "border-slate-600 text-slate-500" : "border-[#c99a3d]/50 text-[#e0b763]"}`}><Icon className="h-4 w-4" /></div><span className="text-[9px] font-bold uppercase tracking-wider text-white/45">Mission {mission.number}</span></div>
            <h2 className="font-display text-lg text-[#f4dfaa]">{mission.title}</h2><p className="mt-1 text-[10px] uppercase tracking-wider text-[#6fd7e8]">{mission.location}</p><p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/60">{mission.objective}</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] uppercase text-white/45"><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{mission.estimatedTime}</span><span>{missionStatusLabels[mission.state]} ? {mission.objectives.filter((objective) => objective.complete).length}/{mission.objectives.length} objectives ? {mission.progress}% complete</span></div>
          </button>;
        })}
      </div>
    </section>
  );
}
