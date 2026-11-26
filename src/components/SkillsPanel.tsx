import { BookOpenCheck, Calculator, FlaskConical, Languages, Map, PenLine } from "lucide-react";

import { useGameState } from "@/state/GameState";

const skills = [
  { name: "Reading Comprehension", detail: "Clues, sources, field instructions", icon: BookOpenCheck },
  { name: "Applied Mathematics", detail: "Ratios, area, mass, estimation", icon: Calculator },
  { name: "Map & Geography", detail: "Scale, bearings, terrain", icon: Map },
  { name: "Scientific Thinking", detail: "Observation, systems, evidence", icon: FlaskConical },
  { name: "Writing", detail: "Explanations, notes, mission reports", icon: PenLine },
  { name: "Language & Communication", detail: "Vocabulary, spelling, ASL clues", icon: Languages },
];

export function SkillsPanel() {
  const { missions } = useGameState();
  const total = missions.reduce((sum, mission) => sum + mission.objectives.length, 0);
  const completed = missions.reduce((sum, mission) => sum + mission.objectives.filter((objective) => objective.complete).length, 0);
  return <section className="content-panel game-panel"><div className="panel-heading"><span className="eyebrow">Expedition skills</span><span className="text-[9px] uppercase tracking-wider text-white/45">Campaign practice</span></div><div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">{skills.map(({ name, detail, icon: Icon }) => <div key={name} className="rounded-lg border border-[#c99a3d]/25 bg-[#0a2027] p-4"><Icon className="mb-3 h-6 w-6 text-[#e0b763]" /><h2 className="text-sm font-bold text-[#f2e8c9]">{name}</h2><p className="mt-1 text-[11px] text-white/50">{detail}</p><div className="mt-4 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#45c9e7]" style={{ width: `${completed / total * 100}%` }} /></div><p className="mt-2 text-[8px] uppercase tracking-wider text-white/35">{completed}/{total} expedition objectives practiced</p></div>)}</div></section>;
}
