import { BookOpen, Clock3, PackageCheck, ShieldCheck, TentTree } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { useGameState } from "@/state/GameState";
import { academyRequirements } from "@/data/missionContent";

export function ParentDashboardPanel() {
  const { missions, selectedMission, inventory, notes, missionRuns } = useGameState();
  const required = inventory.filter((item) => selectedMission.supplyIds.includes(item.id));
  const packed = required.filter((item) => item.available && item.packed && Number.parseFloat(item.quantity) > 0).length;
  const attempts = Object.values(missionRuns).flatMap((run) => Object.values(run.attempts)).reduce((sum, count) => sum + count, 0);
  const completed = missions.filter((mission) => mission.state === "completed").length;
  const academyCompleted = academyRequirements.filter(({ id }) => missionRuns.northwind.academyWork[id]).length;
  const stats = [
    { label: "Current mission", value: selectedMission.title, icon: TentTree },
    { label: "Mission progress", value: `${selectedMission.progress}%`, icon: ShieldCheck },
    { label: "Missions completed", value: `${completed} / ${missions.length}`, icon: TentTree },
    { label: "Supplies status", value: `${packed} / ${required.length} packed`, icon: PackageCheck },
    { label: "Notebook activity", value: `${notes.length} notes`, icon: BookOpen },
    { label: "Attempts recorded", value: String(attempts), icon: Clock3 },
    { label: "Academy Work checked", value: `${academyCompleted} / ${academyRequirements.length}`, icon: BookOpen },
  ];

  return (
    <PanelModal title="Parent Dashboard" subtitle="Local expedition overview" icon={ShieldCheck} wide>
      <div className="mb-4 rounded border border-[#c99a3d]/25 bg-[#c99a3d]/5 px-3 py-2 text-[10px] text-[#d9c79f]">This overview shows expedition activity saved on this device. Academy Work is self-reported.</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[.035] p-4">
            <Icon className="h-5 w-5 text-[#e0b961]" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</p>
              <p className="text-sm font-semibold text-[#f0ead9]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </PanelModal>
  );
}
