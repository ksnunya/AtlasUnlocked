import { useState } from "react";
import { BookOpenCheck, CheckCircle2, NotebookPen } from "lucide-react";
import { missionBriefing, readingTask } from "@/data/missionContent";
import { useGameState } from "@/state/GameState";

export function ReadingTask() {
  const { missionRun, notes, updateMissionRun, recordAttempt, setMissionStage, setOverlay } = useGameState();
  const [answers, setAnswers] = useState<Record<string, string>>(() => ({ ...missionRun.answers }));
  const [feedback, setFeedback] = useState("");
  const questionsDone = readingTask.questions.every((question) => missionRun.completedTasks.includes(question.id));
  const noteDone = missionRun.completedTasks.includes("trail-note") || (missionRun.noteBaselineIds ? notes.some((note) => !missionRun.noteBaselineIds.includes(note.id)) : notes.length > missionRun.noteBaseline);
  const submit = () => {
    if (readingTask.questions.some((question) => !answers[question.id])) { setFeedback("Choose an answer for both questions first."); return; }
    const results = readingTask.questions.map((question) => ({ question, correct: answers[question.id] === question.answer }));
    results.forEach(({ question, correct }) => recordAttempt(question.id, answers[question.id], correct));
    setFeedback(results.every((item) => item.correct) ? "Briefing understood. Now confirm you saved one useful note." : `Not quite. ${readingTask.hints[0]} Try again.`);
  };
  const continueRoute = () => { if (!questionsDone || !noteDone) { setFeedback("Open the Notebook and add one short, useful note before continuing."); return; } updateMissionRun({ completedTasks: missionRun.completedTasks.includes("trail-note") ? missionRun.completedTasks : [...missionRun.completedTasks, "trail-note"] }); setMissionStage("asl"); };
  return <div><div className="mb-4 flex items-center gap-3"><BookOpenCheck className="h-6 w-6 text-[#e0b862]" /><div><p className="text-[9px] font-bold uppercase tracking-wider text-[#6dd6e9]">Checkpoint 1 · Trailhead</p><h2 className="font-display text-xl text-[#f0dca8]">Read the field briefing</h2></div></div><article className="rounded-lg border border-[#c99a3d]/25 bg-[#e9dfc4] p-4 text-[12px] leading-6 text-[#34413b] shadow-inner">{missionBriefing}</article><p className="my-3 flex items-center gap-2 text-[10px] italic text-[#d8c89e]"><NotebookPen className="h-4 w-4 text-[#e2b967]" />A good field note is short, useful, and specific.</p><div className="grid gap-3 md:grid-cols-2">{readingTask.questions.map((question) => <fieldset key={question.id} className="rounded-lg border border-white/10 bg-white/[.025] p-3"><legend className="px-1 text-xs font-semibold text-[#ece5d3]">{question.prompt}</legend><div className="mt-2 space-y-1">{question.options.map((option) => <label key={option} className={`flex cursor-pointer items-center gap-2 rounded border p-2 text-[11px] ${answers[question.id] === option ? "border-[#61d1e6] bg-[#61d1e6]/10" : "border-white/10"}`}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} />{option}</label>)}</div></fieldset>)}</div>{feedback && <p role="status" className={`mt-3 rounded border p-2 text-[10px] ${feedback.startsWith("Briefing") ? "border-[#5dc98b]/30 text-[#71d79d]" : "border-[#d3a24f]/30 text-[#e4bf6b]"}`}>{feedback}</p>}<div className="mt-4 grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => setOverlay("hints")} className="mission-secondary">Hints & explanations</button><button type="button" onClick={submit} className="mission-secondary">Check answers</button><button type="button" disabled={!questionsDone} onClick={continueRoute} className="mission-primary disabled:cursor-not-allowed disabled:opacity-40">{noteDone ? "Continue" : "Add note to continue"}</button></div></div>;
}
