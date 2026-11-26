import { useState } from "react";
import { Beaker, CheckCircle2, ClipboardList, FlaskConical, Microscope, PackageSearch, Undo2, XCircle } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { useGameState } from "@/state/GameState";
import { scienceTask } from "@/data/missionContent";

const choices = [
  { id: "experiment", label: "Current Experiment", icon: Beaker },
  { id: "equipment", label: "Equipment", icon: Microscope },
  { id: "notes", label: "Lab Notes", icon: ClipboardList },
];
const labItemIds = ["notebook", "ruler", "water", "toolkit", "battery", "relay"];
export function FieldLabPanel() {
  const { missions, inventory, lab, prepareRelay, runLabExperiment, setOverlay, setActiveView, setActiveNoteTab, closeMission } = useGameState();
  const [selected, setSelected] = useState(choices[0]);
  const [material, setMaterial] = useState("");
  const [feedback, setFeedback] = useState("");
  const canPrepare = missions.some((mission) => mission.id === "northwind" && mission.state === "completed") && inventory.some((item) => item.id === "toolkit" && item.available && item.packed && Number.parseFloat(item.quantity) > 0);
  const openLabNotes = () => { closeMission(); setActiveNoteTab("Clues"); setActiveView("Notebook"); setOverlay(null); };
  return <PanelModal title="Field Lab" subtitle="Permanent location - Return anytime" icon={FlaskConical} wide>
    <p className="mb-4 text-xs text-white/60">Analyze field evidence, prepare expedition equipment, and record observations in the shared Notebook.</p>
    <div className="grid gap-4 md:grid-cols-[220px_1fr]"><div className="space-y-2">{choices.map((choice) => { const Icon = choice.icon; return <button key={choice.id} type="button" onClick={() => setSelected(choice)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${selected.id === choice.id ? "border-[#65d4e9] bg-[#65d4e9]/10" : "border-[#c99a3d]/25 bg-white/[.035] hover:bg-white/[.07]"}`}><Icon className="h-5 w-5 text-[#e4bb62]" /><span><b className="block text-xs text-[#f0ead8]">{choice.label}</b><small className="text-[9px] text-white/40">Open section</small></span></button>; })}</div>
    <section className="rounded-lg border border-white/10 bg-black/10 p-4"><h3 className="font-display text-lg text-[#f0d99f]">{selected.label}</h3>
      {selected.id === "experiment" && <div className="mt-3"><p className="text-xs text-white/60">{scienceTask.prompt}</p><div className="my-3 space-y-1">{scienceTask.observations.map((observation) => <p key={observation} className="text-[11px] text-white/60">{observation}</p>)}</div>{scienceTask.options.map((option) => <label key={option} className="mb-2 flex gap-2 text-xs text-white/65"><input type="radio" name="lab-material" checked={material === option} onChange={() => setMaterial(option)} />{option}</label>)}<button type="button" disabled={!material || lab.experimentCompleted} onClick={() => { runLabExperiment(material); setFeedback(material === scienceTask.answer ? "Experiment complete. Observation saved in the Notebook." : "Try again. The best insulation has the smallest temperature drop."); }} className="mission-secondary mt-3 w-full disabled:opacity-40">{lab.experimentCompleted ? "Experiment recorded" : "Analyze insulation"}</button>{feedback && <p role="status" className="mt-3 text-xs text-[#e2bd6d]">{feedback}</p>}</div>}
      {selected.id === "equipment" && <div className="mt-3"><div className="grid gap-2 sm:grid-cols-2">{labItemIds.map((id) => { const item = inventory.find((supply) => supply.id === id); return item && <div key={id} className="flex items-center justify-between rounded border border-white/10 p-2.5"><b className="text-[10px] text-[#eee5cf]">{item.name}</b>{item.available ? <CheckCircle2 className="h-4 w-4 text-[#68d69a]" /> : <XCircle className="h-4 w-4 text-[#d99f59]" />}</div>; })}</div><button type="button" disabled={!canPrepare || lab.relayPrepared} onClick={prepareRelay} className="mission-secondary mt-3 w-full disabled:opacity-40">{lab.relayPrepared ? "Signal relay prepared" : "Prepare signal relay"}</button>{!canPrepare && !lab.relayPrepared && <p className="mt-2 text-[10px] text-[#e2bd6d]">Restore Northwind and pack an available repair toolkit to prepare the relay.</p>}<button type="button" onClick={() => setOverlay("inventory")} className="mission-secondary mt-3 flex w-full items-center justify-center gap-2"><PackageSearch className="h-4 w-4" /> Manage connected inventory</button></div>}
      {selected.id === "notes" && <button type="button" onClick={openLabNotes} className="mission-secondary mt-4 w-full">Open shared lab notes</button>}
    </section></div><button type="button" onClick={() => setOverlay(null)} className="mission-secondary mt-4 flex w-full items-center justify-center gap-2"><Undo2 className="h-4 w-4" /> Return to Map / Mission</button>
  </PanelModal>;
}
