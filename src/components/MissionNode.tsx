import { Check, FlaskConical, LockKeyhole, RadioTower, ShieldAlert } from "lucide-react";

export type MissionNodeState = "locked" | "available" | "active" | "completed" | "lab";

interface MissionNodeProps {
  x: string;
  y: string;
  label: string;
  state: MissionNodeState;
  code: string;
  selected?: boolean;
  ariaLabel?: string;
  missionId?: string;
  location?: string;
  objectiveCount?: string;
  onClick: () => void;
}

const styles: Record<MissionNodeState, string> = {
  locked: "border-slate-500 bg-slate-800/90 text-slate-400",
  available: "border-[#e2b75f] bg-[#18343a] text-[#f2d98e]",
  active: "border-[#7ce7ff] bg-[#0f5367] text-white shadow-[0_0_0_5px_rgba(74,205,239,.2),0_0_24px_rgba(65,203,239,.7)]",
  completed: "border-[#7ad7a0] bg-[#176148] text-white",
  lab: "rounded-md border-[#e2b75f] bg-[#184a4d] text-[#f2d98e] shadow-[0_0_18px_rgba(226,183,95,.45)]",
};
const icons = { locked: LockKeyhole, available: ShieldAlert, active: RadioTower, completed: Check, lab: FlaskConical };

export function MissionNode({ x, y, label, state, code, selected, ariaLabel, missionId, location, objectiveCount, onClick }: MissionNodeProps) {
  const Icon = icons[state];
  return (
    <button type="button" onClick={onClick} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 text-left" style={{ left: x, top: y }} aria-label={ariaLabel ?? `${label}, ${state}`} aria-current={selected ? "step" : undefined} data-mission-id={missionId} data-mission-state={state}>
      <div className={`grid h-10 w-10 place-items-center rounded-full border-2 transition-transform group-hover:scale-110 lg:h-12 lg:w-12 ${styles[state]} ${selected ? "ring-2 ring-white ring-offset-2 ring-offset-[#0b2830]" : ""}`}>
        <Icon className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
      </div>
      <div className={`absolute left-1/2 top-[calc(100%+5px)] w-max max-w-[180px] -translate-x-1/2 rounded border px-2 py-1 text-center backdrop-blur ${selected || state === "active" ? "border-[#7ce7ff]/60 bg-[#082632]/95" : "border-white/20 bg-[#091d24]/90"}`}>
        <span className="block text-[8px] font-bold uppercase tracking-[.18em] text-[#c99a3d]">{code}</span>
        <span className="block text-[10px] font-semibold leading-tight text-white">{label}</span>
        {location && <span className="block text-[8px] text-white/65">{location}</span>}
        {objectiveCount && <span className="block text-[8px] text-white/65">{objectiveCount}</span>}
      </div>
    </button>
  );
}
