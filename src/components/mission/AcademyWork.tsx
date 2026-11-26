import { CheckCircle2, Circle } from "lucide-react";
import { academyRequirements } from "@/data/missionContent";
import { useGameState } from "@/state/GameState";

export function AcademyWork() {
  const { missionRun, toggleAcademyWork, setMissionStage } = useGameState();
  const done = Object.values(missionRun.academyWork).filter(Boolean).length;
  return <div><div className="mb-4 flex items-center justify-between rounded-lg border border-[#c99a3d]/25 bg-[#c99a3d]/5 p-3"><p className="max-w-xl text-xs leading-relaxed text-white/60">Use this optional study checklist to track your own completed coursework. Mission activities are checked separately.</p><span className="ml-3 text-sm font-bold text-[#efd58f]">{done}/5</span></div><div className="space-y-2">{academyRequirements.map((item) => { const complete = missionRun.academyWork[item.id]; return <button key={item.id} type="button" onClick={() => toggleAcademyWork(item.id)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${complete ? "border-[#55c68a]/35 bg-[#55c68a]/5" : "border-white/10 bg-white/[.025]"}`}>{complete ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#68d69b]" /> : <Circle className="h-5 w-5 shrink-0 text-white/25" />}<span className="min-w-0 flex-1"><b className="block text-xs text-[#f0e8d4]">{item.subject}</b><small className="text-[10px] text-white/45">{item.assignment}</small></span><span className={`text-[8px] font-bold uppercase tracking-wider ${complete ? "text-[#68d69b]" : "text-white/35"}`}>{complete ? "Completed" : "Not started"}</span></button>; })}</div><button type="button" onClick={() => setMissionStage("route")} className="mission-primary mt-5 w-full">Continue to field route</button></div>;
}
