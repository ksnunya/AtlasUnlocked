import { useState } from "react";
import { Hand } from "lucide-react";
import { aslRounds } from "@/data/missionMedia";
import { useGameState } from "@/state/GameState";

export function AslClueTask() {
  const { missionRun, recordAttempt, setMissionStage, setOverlay, updateMissionRun } = useGameState();
  // Older saves retain their completed ASL checkpoint.
  const legacyComplete = missionRun.completedTasks.includes("asl");
  const [index, setIndex] = useState(Math.min(missionRun.aslRoundIndex ?? aslRounds.filter((round) => missionRun.completedTasks.includes(round.id)).length, aslRounds.length - 1));
  const round = aslRounds[index];
  const video = round.video;
  const [answer, setAnswer] = useState(missionRun.answers[round.id] ?? "");
  const [feedback, setFeedback] = useState("");
  const [failedVideo, setFailedVideo] = useState<string | null>(null);
  const complete = legacyComplete || missionRun.completedTasks.includes(round.id);
  const checkAnswer = () => {
    if (!round.options.includes(answer)) {
      setFeedback("Choose an interpretation first.");
      return;
    }
    const correct = answer === round.answer;
    updateMissionRun({ aslRoundIndex: index });
    recordAttempt(round.id, answer, correct);
    setFeedback(correct ? "Correct. You understood the message." : video
      ? "Not yet. Replay the clip and watch the full phrase."
      : "Not yet. Think about who is offering assistance.");
  };
  const next = () => {
    if (!complete) return;
    if (legacyComplete || index === aslRounds.length - 1) setMissionStage("cache");
    else { const nextIndex = index + 1; setIndex(nextIndex); updateMissionRun({ aslRoundIndex: nextIndex }); setAnswer(missionRun.answers[aslRounds[nextIndex].id] ?? ""); setFeedback(""); }
  };
  return <div>
    <div className="mb-4 flex items-center gap-3"><Hand className="h-6 w-6 text-[#e0b862]" /><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#6dd6e9]">Trail encounter ? ASL</p><h2 className="font-display text-xl text-[#f0dca8]">Understand the expedition guide</h2></div></div>
    <div className={video ? "grid gap-5 md:grid-cols-2" : "mx-auto w-full max-w-lg"}>
      {video && <section className="task-card"><p>ASL round {index + 1} of {aslRounds.length}. Watch the signer before answering.</p><video key={video} src={video} aria-label={`ASL exercise ${index + 1}`} onError={() => setFailedVideo(video)} controls playsInline preload="metadata" className="mt-3 aspect-video w-full bg-black object-contain">Your browser does not support this ASL video.</video>
        {failedVideo === video && <p role="status" className="mt-2 text-xs text-[#e4bf6b]">This clip could not load. Check the local media setup in the README. You can use the Hint button to review the signed phrase.</p>}
      </section>}
      <section className="task-card"><fieldset className="space-y-2"><legend className="mb-3 font-semibold">{round.prompt}</legend>{round.options.map((option) => <label key={option} className="flex items-center gap-2 rounded border border-white/10 p-2.5 text-xs focus-within:ring-2 focus-within:ring-cyan-300"><input type="radio" name="asl-phrase" checked={answer === option} disabled={complete} onChange={() => { setAnswer(option); setFeedback(""); }} onKeyDown={(event) => {
        if (!video && !complete && answer === option && event.key === "Enter" && !event.repeat) {
          event.preventDefault();
          checkAnswer();
        }
      }} />{option}</label>)}</fieldset>
      {feedback && <p role="status" className="mt-3 text-xs text-[#e4bf6b]">{feedback}</p>}{complete && <p role="status" className="mt-3 text-xs text-[#68d69c]">Signed message understood.</p>}
      <div className="mt-4 grid grid-cols-3 gap-2"><button type="button" onClick={() => setOverlay("hints")} className="mission-secondary">Hint</button><button type="button" disabled={complete} onClick={checkAnswer} className="mission-secondary disabled:opacity-40">{video ? "Interpret sign" : "Check answer"}</button><button type="button" disabled={!complete} onClick={next} className="mission-primary disabled:opacity-40">{legacyComplete || index === aslRounds.length - 1 ? "Continue" : "Next ASL clip"}</button></div></section>
    </div>
  </div>;
}
