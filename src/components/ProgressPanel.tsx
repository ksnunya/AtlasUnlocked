import { CheckCircle2, CircleDot, Flag } from "lucide-react";
import { useGameState } from "@/state/GameState";

export function ProgressPanel() {
  const { missions } = useGameState();
  const completed = missions.filter((mission) => mission.state === "completed");
  const active = missions.filter((mission) => mission.state === "active");
  return <section className="content-panel game-panel"><div className="panel-heading"><span className="eyebrow">Expedition progress</span><span className="text-[9px] uppercase tracking-wider text-white/45">Local expedition record</span></div><div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_260px]">
    <div><h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#74dba1]"><CheckCircle2 className="h-4 w-4" /> Completed missions</h2>{completed.length === 0 && <p className="text-xs text-white/45">No completed missions.</p>}{completed.map((mission) => <div key={mission.id} className="mb-2 rounded border border-[#4ab77b]/25 bg-[#4ab77b]/5 p-3"><p className="font-display text-sm text-[#ecdfbd]">{mission.title}</p><p className="text-[9px] text-white/45">{mission.location} · 100%</p></div>)}</div>
    <div><h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6fdaed]"><CircleDot className="h-4 w-4" /> Active missions</h2>{active.length ? active.map((mission) => <div key={mission.id} className="mb-2 rounded border border-[#45c9e7]/30 bg-[#45c9e7]/5 p-3"><p className="font-display text-sm text-[#ecdfbd]">{mission.title}</p><p className="text-[9px] text-white/45">{mission.progress}% · {mission.objectives.filter((item) => item.complete).length}/{mission.objectives.length} objectives</p></div>) : <p className="text-xs text-white/45">No active missions.</p>}</div>
    <div className="rounded-lg border border-[#c99a3d]/25 bg-[#0a2027] p-5 text-center"><Flag className="mx-auto h-8 w-8 text-[#e2b761]" /><p className="mt-3 font-display text-3xl text-[#f0d38d]">{completed.length}</p><p className="text-[9px] uppercase tracking-widest text-white/45">Missions completed</p><p className="mt-5 text-[10px] text-white/40">{completed.length === missions.length ? "All five missions completed." : "Finish each mission to unlock the next expedition route."}</p></div>
  </div></section>;
}
