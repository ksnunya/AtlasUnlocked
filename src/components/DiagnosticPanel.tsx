import { useState } from "react";
import { Activity } from "lucide-react";
import { PanelModal } from "./PanelModal";
import { areaTask } from "@/data/missionContent";
import { useGameState } from "@/state/GameState";
export function DiagnosticPanel() {
  const { missionRun, recordAttempt } = useGameState();
  const [answer, setAnswer] = useState(missionRun.answers["diagnostic-area"] ?? "");
  const [feedback, setFeedback] = useState("");
  return <PanelModal title="Diagnostic" subtitle="Optional expedition readiness check" icon={Activity}><p className="text-xs text-white/65">{areaTask.prompt}</p><input aria-label="Diagnostic area" value={answer} onChange={(event) => setAnswer(event.target.value)} inputMode="decimal" className="mission-input mt-3 w-full" /><button type="button" className="mission-secondary mt-3 w-full" onClick={() => { const correct = answer.trim() !== "" && Number(answer) === Number(areaTask.answer); recordAttempt("diagnostic-area", answer, correct); setFeedback(correct ? "Correct. You are ready to calculate rectangular areas." : areaTask.hints[1]); }}>Check readiness</button>{feedback && <p role="status" className="mt-3 text-xs text-[#e2bd6d]">{feedback}</p>}<p className="mt-3 text-[10px] text-white/40">Your attempt is saved with this mission. This check does not complete field objectives.</p></PanelModal>;
}
