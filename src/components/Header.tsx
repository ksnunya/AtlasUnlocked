import { CalendarDays, Compass, HelpCircle } from "lucide-react";
import { Navigation } from "./Navigation";
import { PlayerAvatar } from "./PlayerAvatar";
import { useGameState } from "@/state/GameState";

export function Header() {
  const { missions, setOverlay } = useGameState();
  const completed = missions.filter((mission) => mission.state === "completed").length;
  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between border-b border-[#c99a3d]/50 bg-[#071721]/95 px-3 shadow-[0_4px_20px_rgba(0,0,0,.45)] lg:h-[74px] lg:flex-nowrap lg:px-5">
      <div className="flex h-[72px] min-w-fit items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#c99a3d] bg-[#102d30] shadow-[inset_0_0_0_3px_#07171c,0_0_16px_rgba(201,154,61,.25)]">
          <Compass className="h-10 w-10 text-[#e3b85f]" strokeWidth={1.25} />
        </div>
        <div>
          <p className="font-display text-[22px] leading-none tracking-[0.14em] text-[#f0cd7c] sm:text-[26px]">Atlas Unlocked</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.33em] text-[#c2d6cf]">Academy · Explore · Learn · Prepare</p>
        </div>
      </div>

      <Navigation />

      <div className="flex items-center gap-2 py-2 lg:py-0">
        <button type="button" onClick={() => setOverlay("today")} aria-label="Open today's organization view" title="Today" className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[.06] px-3 py-2 text-[11px] text-[#d9e5df] hover:bg-white/10 xl:flex">
          <CalendarDays className="h-4 w-4 text-[#e3b85f]" />
          <div className="text-left"><b className="block font-semibold">Expedition campaign</b><span className="text-white/55">Open Today</span></div>
        </button>
        <button type="button" onClick={() => setOverlay("today")} aria-label="Open today's organization view" title="Today" className="grid h-9 w-9 place-items-center rounded-full border border-[#6bcfe3]/40 text-[#77d9eb] hover:bg-[#6bcfe3]/10 xl:hidden">
          <CalendarDays className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => setOverlay("tutorial")} aria-label="Open tutorial" title="Reopen tutorial" className="grid h-9 w-9 place-items-center rounded-full border border-[#c99a3d]/50 text-[#e5c577] hover:bg-[#c99a3d]/15">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => setOverlay("profile")} className="flex items-center gap-3 rounded-lg p-1 text-right hover:bg-white/[.06]" aria-label="Open player profile">
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white">Expedition Explorer</p>
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#42c98e]" style={{ width: `${completed / missions.length * 100}%` }} /></div>
            <p className="mt-1 text-[9px] uppercase tracking-wider text-white/55">{completed} / {missions.length} missions completed</p>
          </div>
          <PlayerAvatar size="md" />
        </button>
      </div>
    </header>
  );
}
