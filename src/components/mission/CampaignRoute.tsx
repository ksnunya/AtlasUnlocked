import { missionMedia } from "@/data/missionMedia";
import { useState } from "react";
import { CheckCircle2, MapPinned } from "lucide-react";
import { campaignTasks, correctTaskAnswer, taskRequirement } from "@/data/campaignContent";
import { useGameState } from "@/state/GameState";

export function CampaignRoute() {
  const { selectedMission, missionRun, inventory, notes, lab, completeObjective, updateMissionRun, setMissionStage, setOverlay } = useGameState();
  const tasks = campaignTasks[selectedMission.id];
  const index = Math.max(0, Math.min(missionRun.objectiveIndex ?? 0, tasks.length - 1));
  const task = tasks[index];
  const objective = selectedMission.objectives.find((item) => item.id === task.id)!;
  const [answer, setAnswer] = useState(missionRun.answers[task.id] ?? "");
  const [feedback, setFeedback] = useState("");
  const requirement = taskRequirement(task, selectedMission, missionRun, inventory, notes, lab.relayPrepared);
  const check = () => {
    const value = task.kind === "action" ? task.answer : answer;
    completeObjective(task.id, value);
    setFeedback(!correctTaskAnswer(task, value) ? `Not quite. ${task.hints[0]}` : requirement ?? "Objective complete. Your expedition record has been updated.");
  };
  const next = () => {
    if (!objective.complete) return;
    if (index === tasks.length - 1) { setMissionStage("summary"); setOverlay("complete"); }
    else updateMissionRun({ objectiveIndex: index + 1 });
  };
  return <div>
    <div className="mb-4 flex items-center gap-3"><MapPinned className="h-6 w-6 text-[#e0b862]" /><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#6dd6e9]">Checkpoint {index + 1} of {tasks.length}</p><h2 className="font-display text-xl text-[#f0dca8]">{objective.text}</h2></div></div>
    <section className="task-card"><p>{task.brief}</p><h3 className="mt-4">{task.prompt}</h3>
      {task.kind === "choice" && <fieldset className="mt-3 space-y-2"><legend className="sr-only">{objective.text}</legend>{task.options?.map((option) => <label key={option} className={`flex cursor-pointer items-center gap-2 rounded border p-2.5 text-xs ${answer === option ? "border-[#60d2e7] bg-[#60d2e7]/10" : "border-white/10"}`}><input type="radio" name={task.id} checked={answer === option} onChange={() => setAnswer(option)} />{option}</label>)}</fieldset>}
      {task.kind === "number" && <input aria-label={task.prompt} inputMode="decimal" value={answer} onChange={(event) => setAnswer(event.target.value)} className="mission-input mt-3" />}
      {task.needsNote && <p className="mt-3 text-[10px] text-[#e2bd6d]">Save a new observation using the Notebook button.</p>}
      {task.needsSupplies && <p className="mt-3 text-[10px] text-[#e2bd6d]">Required supplies must be available, have a positive quantity, and be packed.</p>}
      {task.needsRelay && <button type="button" onClick={() => setOverlay("lab")} className="mission-secondary mt-3">Open Field Lab</button>}
      {objective.complete ? <p role="status" className="mt-4 flex items-center gap-2 text-xs text-[#68d69c]"><CheckCircle2 className="h-4 w-4" />Objective complete</p> : <button type="button" onClick={check} disabled={task.kind === "action" && !!requirement} className="mission-small mt-4 disabled:opacity-40">{task.actionLabel ?? "Check answer"}</button>}
      {requirement && !objective.complete && <p role="status" className="mt-3 text-xs text-[#e2bd6d]">{requirement}</p>}
      {feedback && <p role="status" className="mt-3 text-xs text-[#e2bd6d]">{feedback}</p>}
      {selectedMission.id === "base-camp" && task.id === "b3" && objective.complete && <section className="mt-4"><h3>Camp action</h3><p>The field-action clip follows the camp setup decision.</p><video src={missionMedia.actions.makeFire} aria-label="Base Camp field action" controls playsInline preload="metadata" className="mt-3 aspect-video w-full bg-black object-contain">Your browser does not support this camp action video.</video></section>}
    </section>
    <div className="mt-4 grid grid-cols-3 gap-2"><button type="button" disabled={index === 0} onClick={() => updateMissionRun({ objectiveIndex: index - 1 })} className="mission-secondary disabled:opacity-40">Previous objective</button><button type="button" onClick={() => setOverlay("hints")} className="mission-secondary">Hints & explanations</button><button type="button" disabled={!objective.complete} onClick={next} className="mission-primary disabled:opacity-40">{index === tasks.length - 1 ? "Review mission" : "Next objective"}</button></div>
  </div>;
}
