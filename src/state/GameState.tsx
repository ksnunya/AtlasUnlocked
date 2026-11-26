import { aslCheckpointComplete } from "@/data/campaignContent";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type FieldNote, type InventoryItem, type Mission, type NoteCategory, type OverlayName, type PhysicalCategory, type ViewName } from "@/data/gameData";
import { type MissionRunState, type MissionStage, scienceTask } from "@/data/missionContent";
import { campaignOrder, campaignTasks, correctTaskAnswer, taskRequirement, northwindRequiredTasks } from "@/data/campaignContent";
import { completeMission, completionBlocker, loadCampaign, selectCampaignMission, synchronizeCampaign, updateRun, type CampaignState } from "./campaignState";

interface SavedGame extends CampaignState { schemaVersion?: number; missionRun?: MissionRunState; activeNoteTab?: NoteCategory; tutorialCompleted?: boolean }
interface NewInventoryItem { name: string; quantity: string; physicalCategory: PhysicalCategory }
interface GameStateValue {
  missions: Mission[]; selectedMission: Mission; inventory: InventoryItem[]; notes: FieldNote[]; activeView: ViewName; overlay: OverlayName; notice: string | null; activeNoteTab: NoteCategory; missionRun: MissionRunState; missionRuns: CampaignState["missionRuns"]; tutorialCompleted: boolean;
  setActiveView: (view: ViewName) => void; setOverlay: (overlay: OverlayName) => void; selectMission: (id: string) => void; togglePacked: (id: string) => void; updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void; addInventoryItem: (item: NewInventoryItem) => void; deleteInventoryItem: (id: string) => void;
  addNote: (category: NoteCategory, text: string) => void; editNote: (id: string, text: string) => void; deleteNote: (id: string) => void; moveNote: (id: string, category: NoteCategory) => void; toggleImportantNote: (id: string) => void; setActiveNoteTab: (tab: NoteCategory) => void;
  startMission: (missionId?: string) => void; closeMission: () => void; setMissionStage: (stage: MissionStage) => void; updateMissionRun: (patch: Partial<MissionRunState>) => void; recordAttempt: (taskId: string, answer: string, correct: boolean) => void; toggleAcademyWork: (id: string) => void; finishVerticalSlice: () => void; finishSelectedMission: () => void;
  completeObjective: (id: string, answer: string) => void; prepareRelay: () => void; runLabExperiment: (answer: string) => void; lab: CampaignState["lab"]; completionReady: boolean; completionReason: string | null;
  completeTutorial: () => void; clearNotice: () => void; showNotice: (message: string) => void;
}


// Keep the original browser key so the renamed game reads and updates existing saves.
const STORAGE_KEY = "world-prep-academy-phase3";
const GameStateContext = createContext<GameStateValue | null>(null);
function loadSavedGame(): SavedGame | null { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
const stageProgress: Record<MissionStage, number> = { intro: 0, supplies: 5, academy: 10, route: 15, trailhead: 25, asl: 40, cache: 55, station: 75, summary: 95, objectives: 15 };
const newId = (prefix: string) => `${prefix}-${crypto.getRandomValues(new Uint32Array(2)).join("-")}`;

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [saved] = useState(loadSavedGame);
  const [game, setGame] = useState<CampaignState>(() => loadCampaign(saved));
  const [tutorialCompleted, setTutorialCompleted] = useState(saved?.tutorialCompleted ?? false);
  const [activeNoteTab, setActiveNoteTab] = useState<NoteCategory>(saved?.activeNoteTab ?? "Clues");
  const [activeView, setView] = useState<ViewName>("Map");
  const [overlay, setOverlay] = useState<OverlayName>(saved?.tutorialCompleted ? null : "tutorial");
  const [notice, setNotice] = useState<string | null>(null);
  const { missions, inventory, notes, selectedMissionId, lab } = game;
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId)!;
  const missionRun = game.missionRuns[selectedMissionId];
  const completionReason = completionBlocker(game, selectedMissionId);
  const setMissionRun = (update: (run: MissionRunState) => MissionRunState) => setGame((current) => updateRun(current, selectedMissionId, update));
  const setActiveView = (view: ViewName) => { setView(view); setNotice(null); };
  const closeMission = () => { setMissionRun((run) => ({ ...run, open: false })); setOverlay(null); setView("Map"); };

  useEffect(() => {
    // Retain the old Northwind alias for compatibility; all new progress lives in missionRuns.
    const snapshot = { ...saved, ...game, schemaVersion: 3, missionRun: game.missionRuns.northwind, activeNoteTab, tutorialCompleted };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); }
    catch { setNotice("Unable to save progress on this device. Free browser storage and try again before closing the game."); }
  }, [game, activeNoteTab, tutorialCompleted, saved]);

  const lockedNotice = (id: string) => {
    const index = campaignOrder.indexOf(id);
    const previous = missions.find((mission) => mission.id === campaignOrder[index - 1]);
    setNotice(`Complete ${previous?.title ?? "the previous mission"} to unlock this mission.`);
  };
  const selectMission = (id: string) => {
    const mission = missions.find((item) => item.id === id);
    if (!mission) return;
    if (mission.state === "locked") { lockedNotice(id); return; }
    setGame((current) => selectCampaignMission(current, id)); setActiveView("Map"); setOverlay(null);
  };
  const startMission = (id = selectedMissionId) => {
    const mission = missions.find((item) => item.id === id);
    if (!mission) return;
    if (mission.state === "locked") { lockedNotice(id); return; }
    if (mission.state === "completed") { setGame((current) => selectCampaignMission(current, id)); setOverlay("complete"); setView("Map"); return; }
    setGame((current) => {
      const target = current.missions.find((item) => item.id === id);
      if (!target || target.state === "locked") return current;
      if (target.state === "completed") return selectCampaignMission(current, id);
      const run = current.missionRuns[id];
      const begun = run.started || run.noteBaseline > 0 || run.completedTasks.some((task) => task !== "diagnostic-area") || run.stage !== "intro";
      return synchronizeCampaign({ ...current, selectedMissionId: id,
        missions: current.missions.map((item) => item.id === id ? { ...item, state: "active", nodeCode: "Active mission" } : item),
        missionRuns: { ...current.missionRuns, [id]: { ...run, open: true, started: true, noteBaseline: begun ? run.noteBaseline : current.notes.length, noteBaselineIds: run.noteBaselineIds ?? (begun ? undefined : current.notes.map((note) => note.id)) } } });
    });
    setActiveView("Map"); setOverlay(null);
  };
  const setMissionStage = (stage: MissionStage) => {
    setGame((current) => {
      const run = current.missionRuns[selectedMissionId];
      const mission = current.missions.find((item) => item.id === selectedMissionId)!;
      const requires: Partial<Record<MissionStage, string[]>> = {
        asl: ["reading-direction", "reading-hazard", "trail-note"], cache: ["reading-direction", "reading-hazard", "trail-note", "asl"], station: ["reading-direction", "reading-hazard", "trail-note", "asl", "area", "mass"], summary: northwindRequiredTasks,
      };
      // Earlier updates in this click may have just recorded the required task.
      if (selectedMissionId === "northwind" && requires[stage]?.some((task) => !(task === "asl" ? aslCheckpointComplete(run.completedTasks) : run.completedTasks.includes(task)))) return current;
      if (selectedMissionId !== "northwind" && stage === "summary" && !mission.objectives.every((objective) => objective.complete)) return current;
      const updated = updateRun(current, selectedMissionId, (state) => ({ ...state, stage,
        ...(stage === "station" && !state.stationNoteBaselineIds && state.stationNoteBaseline === 0 ? { stationNoteBaseline: current.notes.length, stationNoteBaselineIds: current.notes.map((note) => note.id) } : {}) }));
      return synchronizeCampaign({ ...updated, missions: updated.missions.map((item) => item.id === selectedMissionId && item.state !== "completed" ? { ...item, progress: Math.max(item.progress, stageProgress[stage]) } : item) });
    });
  };
  const recordAttempt = (taskId: string, answer: string, correct: boolean) => setMissionRun((run) => ({ ...run, answers: { ...run.answers, [taskId]: answer }, attempts: { ...run.attempts, [taskId]: (run.attempts[taskId] ?? 0) + 1 }, completedTasks: correct && !run.completedTasks.includes(taskId) ? [...run.completedTasks, taskId] : run.completedTasks }));
  const completeObjective = (id: string, answer: string) => {
    setGame((current) => {
      const mission = current.missions.find((item) => item.id === selectedMissionId)!;
      const task = campaignTasks[selectedMissionId]?.find((item) => item.id === id);
      if (!task || mission.state === "locked" || mission.state === "completed") return current;
      const index = mission.objectives.findIndex((item) => item.id === id);
      if (mission.objectives[index].complete || mission.objectives.slice(0, index).some((item) => !item.complete)) return current;
      const run = current.missionRuns[selectedMissionId];
      const correct = correctTaskAnswer(task, answer) && !taskRequirement(task, mission, run, current.inventory, current.notes, current.lab.relayPrepared);
      const updated = updateRun(current, selectedMissionId, (state) => ({ ...state, answers: { ...state.answers, [id]: answer }, attempts: { ...state.attempts, [id]: (state.attempts[id] ?? 0) + 1 }, completedTasks: correct ? [...new Set([...state.completedTasks, id])] : state.completedTasks }));
      return updated;
    });
  };
  const finishSelectedMission = () => {
    if (completionReason) { setNotice(completionReason); return; }
    setGame((current) => completeMission(current, selectedMissionId));
    closeMission();
    const next = missions[campaignOrder.indexOf(selectedMissionId) + 1];
    setNotice(selectedMission.state === "completed" ? `${selectedMission.title} is already complete.` : next ? `${selectedMission.title} complete. ${next.title} is now available.` : "Expedition complete. All five missions are finished.");
  };
  const prepareRelay = () => {
    if (!missions.some((mission) => mission.id === "northwind" && mission.state === "completed")) { setNotice("Restore Northwind before preparing the highland relay."); return; }
    if (!inventory.some((item) => item.id === "toolkit" && item.available && item.packed)) { setNotice("Make the repair toolkit available and pack it first."); return; }
    setGame((current) => current.lab.relayPrepared ? current : { ...current, lab: { ...current.lab, relayPrepared: true }, inventory: current.inventory.map((item) => item.id === "relay" ? { ...item, available: true, packed: false, quantity: "1" } : item) });
    setNotice("Signal relay prepared. Pack it in Inventory for Glacier Relay.");
  };
  const runLabExperiment = (answer: string) => {
    if (answer !== scienceTask.answer) { setNotice("Compare the temperature drops: choose the material that retained the most heat."); return; }
    setGame((current) => current.lab.experimentCompleted ? current : { ...current, lab: { ...current.lab, experimentCompleted: true }, notes: [...current.notes, { id: newId("note"), category: "Clues", text: "Lab: wool retained the most heat (3 degree temperature drop).", missionId: selectedMissionId, createdAt: Date.now(), important: false }] });
    setNotice("Experiment complete. The observation is saved in the shared Notebook.");
  };
  const value: GameStateValue = {
    missions, selectedMission, inventory, notes, activeView, overlay, notice, activeNoteTab, missionRun, missionRuns: game.missionRuns, tutorialCompleted, lab, completionReady: completionReason === null, completionReason,
    setActiveView, setOverlay, selectMission, startMission, closeMission, setMissionStage, recordAttempt, completeObjective, prepareRelay, runLabExperiment,
    updateMissionRun: (patch) => setMissionRun((run) => ({ ...run, ...patch })),
    toggleAcademyWork: (id) => setMissionRun((run) => ({ ...run, academyWork: { ...run.academyWork, [id]: !run.academyWork[id] } })),
    finishVerticalSlice: finishSelectedMission, finishSelectedMission,
    togglePacked: (id) => setGame((current) => ({ ...current, inventory: current.inventory.map((item) => item.id === id && item.available && Number.parseFloat(item.quantity) > 0 ? { ...item, packed: !item.packed } : item) })),
    updateInventoryItem: (id, patch) => setGame((current) => ({ ...current, inventory: current.inventory.map((item) => item.id === id ? { ...item, ...patch, ...((patch.available === false || (patch.quantity !== undefined && !(Number.parseFloat(patch.quantity) > 0))) ? { packed: false } : {}) } : item) })),
    addInventoryItem: (item) => setGame((current) => ({ ...current, inventory: [...current.inventory, { ...item, id: newId("custom"), category: "Physical", packed: false, available: true, optional: true, custom: true, icon: "notebook" }] })),
    deleteInventoryItem: (id) => setGame((current) => ({ ...current, inventory: current.inventory.filter((item) => item.id !== id || !item.custom) })),
    addNote: (category, text) => setGame((current) => ({ ...current, notes: [...current.notes, { id: newId("note"), category, text, missionId: current.missionRuns[current.selectedMissionId].open ? current.selectedMissionId : undefined, createdAt: Date.now(), important: false }] })),
    editNote: (id, text) => setGame((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, text } : note) })),
    deleteNote: (id) => setGame((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) })),
    moveNote: (id, category) => setGame((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, category } : note) })),
    toggleImportantNote: (id) => setGame((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, important: !note.important } : note) })),
    setActiveNoteTab, completeTutorial: () => { setTutorialCompleted(true); setOverlay(null); }, clearNotice: () => setNotice(null), showNotice: setNotice,
  };
  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}
export function useGameState() { const context = useContext(GameStateContext); if (!context) throw new Error("useGameState must be used inside GameStateProvider"); return context; }
