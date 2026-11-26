import { useState } from "react";
import { Backpack, BookOpenCheck, Compass, HelpCircle, Map, NotebookPen, TentTree } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { useGameState } from "@/state/GameState";

const steps = [
  { title: "Navigate the expedition", text: "Use Map, Missions, Skills, Notebook, and Progress in the top navigation. Return to Map whenever you need the route.", icon: Compass },
  { title: "Check a mission", text: "Select a mission node, read its objective, and review required skills, time, and supplies before starting.", icon: TentTree },
  { title: "Pack with purpose", text: "Inventory separates real physical supplies from in-game equipment. Mark what you have, then pack what the mission requires.", icon: Backpack },
  { title: "Take useful notes", text: "A good field note is short, useful, and specific.", icon: NotebookPen, examples: true },
  { title: "Stay organized", text: "Use tabs for clues, numbers, places, vocabulary, and tasks. Open Today for a quick plan, then return to the map.", icon: Map },
];

export function TutorialPanel() {
  const { completeTutorial } = useGameState();
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;
  return <PanelModal title="Expedition Guide" subtitle={`Quick tutorial · ${step + 1} of ${steps.length}`} icon={HelpCircle}>
    <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#58cce3] transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
    <div className="min-h-52 rounded-xl border border-[#c99a3d]/25 bg-[#0b252d] p-5 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#c99a3d]/40 bg-[#c99a3d]/10"><Icon className="h-7 w-7 text-[#e0ba66]" /></div><h3 className="mt-4 font-display text-xl text-[#f0d99f]">{current.title}</h3><p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/60">{current.text}</p>
      {current.examples && <div className="mt-4 grid gap-2 text-left sm:grid-cols-2"><div className="rounded border border-[#58c88a]/30 bg-[#58c88a]/5 p-3"><b className="text-[9px] uppercase text-[#6dd89b]">Good</b><p className="mt-1 text-xs text-white/75">“Relay tower north of river.”</p></div><div className="rounded border border-[#d49a55]/30 bg-[#d49a55]/5 p-3"><b className="text-[9px] uppercase text-[#dfa65d]">Not useful</b><p className="mt-1 text-[10px] text-white/55">“The relay tower is something I saw while going through the mission and I think it might be important later.”</p></div></div>}
    </div>
    <div className="mt-4 flex items-center gap-2"><button type="button" onClick={completeTutorial} className="mission-secondary">Skip</button><button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="mission-secondary disabled:opacity-35">Back</button>{step < steps.length - 1 ? <button type="button" onClick={() => setStep((value) => value + 1)} className="mission-primary ml-auto flex-1">Next</button> : <button type="button" onClick={completeTutorial} className="mission-primary ml-auto flex-1">Finish Tutorial</button>}</div>
    <p className="mt-3 flex items-center justify-center gap-1 text-[9px] text-white/35"><BookOpenCheck className="h-3 w-3" /> About 3–5 minutes · Reopen from the header anytime</p>
  </PanelModal>;
}
