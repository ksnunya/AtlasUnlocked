import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { areaTask, aslTask, massTask, readingTask, scienceTask } from "@/data/missionContent";
import { campaignTasks } from "@/data/campaignContent";
import { useGameState } from "@/state/GameState";

export function HintsPanel() {
  const { selectedMission, missionRun } = useGameState();
  const [level, setLevel] = useState(1);
  const taskHints = selectedMission.id !== "northwind" ? (missionRun.stage === "objectives" ? campaignTasks[selectedMission.id]?.[missionRun.objectiveIndex ?? 0]?.hints ?? selectedMission.hints : selectedMission.hints) : missionRun.stage === "trailhead" ? readingTask.hints
    : missionRun.stage === "asl" ? aslTask.hints
    : missionRun.stage === "cache" ? areaTask.hints.map((hint, index) => `Area: ${hint} Mass: ${massTask.hints[index]}`)
    : missionRun.stage === "station" ? scienceTask.hints
    : selectedMission.hints;
  const shown = taskHints.slice(0, level);
  return <PanelModal title="Hints & Explanations" subtitle={`${selectedMission.title} · Level ${level}`} icon={Lightbulb}>
    {shown.map((hint, index) => <div key={`${hint}-${index}`} className="mb-3 flex gap-3 rounded-lg border border-[#c99a3d]/25 bg-[#c99a3d]/5 p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c99a3d] text-xs font-bold text-[#142327]">{index + 1}</span><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#d9b562]">{index === 0 ? "Small clue" : index === 1 ? "Direct explanation" : "Worked reasoning"}</p><p className="mt-1 text-xs leading-relaxed text-white/70">{hint}</p></div></div>)}
    {level < Math.min(3, taskHints.length) ? <button type="button" onClick={() => setLevel((current) => current + 1)} className="mission-secondary w-full">Show next hint level</button> : <p className="text-center text-[9px] uppercase tracking-wider text-white/35">All available support levels shown</p>}
  </PanelModal>;
}
