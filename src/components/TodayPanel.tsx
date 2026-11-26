import { missionHasStarted, missionStatusLabels } from "@/state/campaignState";
import { AlertTriangle, Backpack, BookOpen, CalendarCheck, CheckSquare, School, TentTree } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { useGameState } from "@/state/GameState";

export function TodayPanel() {
  const { selectedMission, missionRun, inventory, notes, setOverlay, setActiveView, startMission, setActiveNoteTab } = useGameState();
  const academyRemaining = Object.values(missionRun.academyWork).filter((complete) => !complete).length;
  const needed = inventory.filter((item) => item.category === "Physical" && selectedMission.supplyIds.includes(item.id) && (!item.available || !item.packed));
  const important = notes.filter((note) => note.important).slice(0, 3);
  const todos = notes.filter((note) => note.category === "To Do").slice(0, 4);
  const openNotebook = () => { setActiveNoteTab("To Do"); setActiveView("Notebook"); setOverlay(null); };
  return <PanelModal title="Today" subtitle="Your compact expedition plan" icon={CalendarCheck} wide>
    <div className="grid gap-3 md:grid-cols-2">
      <section className="rounded-lg border border-[#62cfe5]/25 bg-[#62cfe5]/5 p-4"><TentTree className="mb-2 h-5 w-5 text-[#72d9eb]" /><p className="text-[8px] font-bold uppercase tracking-wider text-white/40">Current mission</p><h3 className="mt-1 font-display text-lg text-[#f0d99f]">{selectedMission.title}</h3><p className="mt-1 text-[10px] text-white/45">{missionStatusLabels[selectedMission.state]} ? {selectedMission.progress}% complete Â· {selectedMission.location}</p><button type="button" onClick={() => { setOverlay(null); startMission(); }} className="mission-small mt-3">{selectedMission.state === "completed" ? "Review mission" : missionHasStarted(selectedMission, missionRun) || selectedMission.state === "active" ? "Continue mission" : "Start mission"}</button></section>
      <section className="rounded-lg border border-[#c99a3d]/25 bg-[#c99a3d]/5 p-4"><School className="mb-2 h-5 w-5 text-[#dfb967]" /><p className="text-[8px] font-bold uppercase tracking-wider text-white/40">Academy Work remaining</p><p className="mt-1 text-2xl font-semibold text-[#f0d99f]">{academyRemaining}</p><p className="text-[10px] text-white/45">Optional study checklist items still marked Not Started</p></section>
      <section className="rounded-lg border border-white/10 bg-white/[.025] p-4"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#dfb967]"><Backpack className="h-4 w-4" /> Physical supplies needed</p><button type="button" onClick={() => setOverlay("inventory")} className="text-[8px] font-bold uppercase text-[#6dd5e8]">Manage</button></div>{needed.length ? <ul className="mt-3 space-y-1">{needed.map((item) => <li key={item.id} className="flex items-center gap-2 text-[10px] text-white/60"><AlertTriangle className="h-3 w-3 text-[#dfa65b]" />{item.name} â€” {!item.available ? "missing" : "not packed"}</li>)}</ul> : <p className="mt-3 text-[10px] text-[#67d699]">All physical mission supplies are ready.</p>}</section>
      <section className="rounded-lg border border-white/10 bg-white/[.025] p-4"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#dfb967]"><BookOpen className="h-4 w-4" /> Important notes</p>{important.length ? <ul className="mt-3 space-y-1">{important.map((note) => <li key={note.id} className="text-[10px] text-white/60">â˜… {note.text}</li>)}</ul> : <p className="mt-3 text-[10px] text-white/35">No notes starred yet.</p>}</section>
      <section className="rounded-lg border border-white/10 bg-white/[.025] p-4 md:col-span-2"><div className="flex items-center justify-between"><p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-[#dfb967]"><CheckSquare className="h-4 w-4" /> To Do</p><button type="button" onClick={openNotebook} className="text-[8px] font-bold uppercase text-[#6dd5e8]">Open notebook</button></div>{todos.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{todos.map((note) => <div key={note.id} className="rounded border border-white/10 px-3 py-2 text-[10px] text-white/60">â–¡ {note.text}</div>)}</div> : <p className="mt-3 text-[10px] text-white/35">No To Do notes yet.</p>}</section>
    </div>
  </PanelModal>;
}
