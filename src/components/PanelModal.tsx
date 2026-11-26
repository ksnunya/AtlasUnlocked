import { X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useGameState } from "@/state/GameState";

export function PanelModal({ title, subtitle, icon: Icon, children, wide = false }: { title: string; subtitle: string; icon: LucideIcon; children: ReactNode; wide?: boolean }) {
  const { setOverlay } = useGameState();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#020a0e]/80 p-4 backdrop-blur-sm" onMouseDown={() => setOverlay(null)}><section role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()} className={`game-panel max-h-[88vh] w-full overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,.75)] ${wide ? "max-w-3xl" : "max-w-lg"}`}>
    <div className="flex items-center gap-3 border-b border-[#c99a3d]/40 bg-[#0c252e] px-4 py-3"><div className="grid h-9 w-9 place-items-center rounded-md border border-[#c99a3d]/40 bg-[#c99a3d]/10 text-[#e5bd67]"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h2 className="font-display text-lg text-[#f1d897]">{title}</h2><p className="text-[9px] uppercase tracking-wider text-white/45">{subtitle}</p></div><button type="button" onClick={() => setOverlay(null)} aria-label="Close panel" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/55 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div>
    <div className="max-h-[calc(88vh-66px)] overflow-y-auto p-4">{children}</div>
  </section></div>;
}
