import { BookOpenText, ChartNoAxesColumnIncreasing, Map, Medal, TentTree } from "lucide-react";
import { useGameState } from "@/state/GameState";
import type { ViewName } from "@/data/gameData";

const items = [
  { label: "Map" as ViewName, icon: Map },
  { label: "Missions" as ViewName, icon: TentTree },
  { label: "Skills" as ViewName, icon: Medal },
  { label: "Notebook" as ViewName, icon: BookOpenText },
  { label: "Progress" as ViewName, icon: ChartNoAxesColumnIncreasing },
];

export function Navigation() {
  const { activeView, setActiveView } = useGameState();
  return (
    <nav aria-label="Primary navigation" className="order-3 flex w-full items-stretch justify-center gap-1 border-t border-white/10 px-2 lg:order-none lg:w-auto lg:border-0 lg:px-0">
      {items.map(({ label, icon: Icon }) => {
        const active = activeView === label;
        return (
          <button key={label} type="button" onClick={() => setActiveView(label)} aria-current={active ? "page" : undefined} className={`group relative flex min-w-16 flex-1 flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors lg:min-w-20 lg:flex-none ${active ? "text-[#8de9ff]" : "text-[#d9d7c9] hover:text-white"}`}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />{label}
            {active && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#35c9ef] shadow-[0_0_10px_#35c9ef]" />}
          </button>
        );
      })}
    </nav>
  );
}
