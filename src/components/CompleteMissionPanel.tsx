import { BookOpen, CheckCircle2, Circle, ClipboardCheck, PackageCheck, RotateCcw, Target, XCircle } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { useGameState } from "@/state/GameState";
import { Button } from "@/components/ui/button";

export function CompleteMissionPanel() {
  const { selectedMission, inventory, notes, missionRun, completionReady, completionReason, finishSelectedMission, startMission, closeMission } = useGameState();
  const done = selectedMission.state === "completed";
  const attempts = Object.values(missionRun.attempts).reduce((sum, count) => sum + count, 0);
  const notesCreated = notes.filter((note) => note.missionId === selectedMission.id && (!missionRun.noteBaselineIds || !missionRun.noteBaselineIds.includes(note.id))).length;
  return <PanelModal title="Complete Mission" subtitle={selectedMission.title} icon={ClipboardCheck} wide>
    <div className="grid gap-5 md:grid-cols-2"><div>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#e1bc6c]">Mission objectives</h3>
      <div className="space-y-2">{selectedMission.objectives.map((objective) => <div key={objective.id} className="flex items-center gap-2 rounded border border-white/10 bg-white/[.03] p-2.5">{objective.complete ? <CheckCircle2 className="h-4 w-4 text-[#68d69c]" /> : <Circle className="h-4 w-4 text-white/30" />}<span className="text-[11px] text-white/70">{objective.text}</span></div>)}</div>
      <h3 className="mb-3 mt-5 text-[10px] font-bold uppercase tracking-wider text-[#e1bc6c]">Required supplies</h3>
      <div className="grid grid-cols-2 gap-2">{selectedMission.supplyIds.map((id) => { const item = inventory.find((supply) => supply.id === id); const ready = item?.available && item.packed && Number.parseFloat(item.quantity) > 0; return <div key={id} className="flex items-center justify-between rounded border border-white/10 bg-white/[.03] p-2"><span className="text-[10px] text-white/65">{item?.name ?? id}</span>{ready ? <CheckCircle2 className="h-3.5 w-3.5 text-[#68d69c]" /> : <XCircle className="h-3.5 w-3.5 text-[#dca65c]" />}</div>; })}</div>
    </div><div><h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#e1bc6c]">Expedition record</h3>
      <div className="grid grid-cols-2 gap-2">{[{ label: "Objectives completed", value: `${selectedMission.objectives.filter((objective) => objective.complete).length}/${selectedMission.objectives.length}`, icon: Target }, { label: "Notes created", value: String(notesCreated), icon: BookOpen }, { label: "Interactions recorded", value: String(missionRun.completedTasks.length), icon: PackageCheck }, { label: "Attempts made", value: String(attempts), icon: RotateCcw }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded border border-[#c99a3d]/20 bg-[#c99a3d]/5 p-3"><Icon className="mb-2 h-4 w-4 text-[#dfb967]" /><p className="text-[8px] font-bold uppercase tracking-wider text-white/40">{label}</p><p className="text-sm font-semibold text-[#eee4cd]">{value}</p></div>)}</div>
      {done ? <Button onClick={closeMission} className="mt-5 w-full bg-[#285b52] font-bold uppercase tracking-wider text-white hover:bg-[#347064]">Return to map</Button> : <><Button disabled={!completionReady} onClick={finishSelectedMission} className="mt-5 w-full bg-[#c99a3d] font-bold uppercase tracking-wider text-[#10232a] hover:bg-[#ddb45c] disabled:opacity-40">Finish mission & return to map</Button>{completionReason && <p role="status" className="mt-3 text-xs text-[#e1bc6c]">{completionReason}</p>}<button type="button" onClick={() => startMission()} className="mission-secondary mt-3 w-full">Continue mission</button></>}
      <p className="mt-3 text-center text-[9px] text-white/35">Mission objectives, inventory, and route progress are saved locally.</p>
    </div></div>
  </PanelModal>;
}
