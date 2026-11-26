import { initialInventory, initialMissions, initialNotes, type Mission, type InventoryItem, type FieldNote } from "@/data/gameData";
import { initialMissionRun, type MissionRunState } from "@/data/missionContent";
import { aslCheckpointComplete, campaignOrder, northwindRequirements, northwindRequiredTasks, suppliesReady } from "@/data/campaignContent";

export interface CampaignState {
  missions: Mission[];
  selectedMissionId: string;
  inventory: InventoryItem[];
  notes: FieldNote[];
  missionRuns: Record<string, MissionRunState>;
  lab: { relayPrepared: boolean; experimentCompleted: boolean };
}
export function freshRun(): MissionRunState {
  return { ...initialMissionRun, answers: {}, attempts: {}, completedTasks: [], inspectedSystems: [], academyWork: { ...initialMissionRun.academyWork } };
}
// Display labels are derived, never trusted from old saved presentation strings.
export const missionStatusLabels = { available: "Available", active: "Active mission", completed: "Completed", locked: "Locked" };
export function missionHasStarted(mission: Mission, run: MissionRunState) {
  return !!run.started || run.stage !== "intro" || run.completedTasks.some((task) => task !== "diagnostic-area") || mission.progress > 0 || mission.objectives.some((objective) => objective.complete);
}
export function synchronizeCampaign(current: CampaignState): CampaignState {
  const missions = current.missions.map((mission) => {
    const run = current.missionRuns[mission.id];
    const objectives = mission.objectives.map((objective) => ({ ...objective, complete: mission.state === "completed" || objective.complete || (mission.id === "northwind" ? !!northwindRequirements[objective.id]?.every((task) => run.completedTasks.includes(task)) : run.completedTasks.includes(objective.id)) }));
    const progress = mission.state === "completed" ? 100 : Math.max(Math.min(mission.progress, 95), Math.floor(objectives.filter((objective) => objective.complete).length / objectives.length * 95));
    const state: Mission["state"] = mission.state === "completed" || mission.state === "locked" ? mission.state : mission.id === current.selectedMissionId && (mission.state === "active" || missionHasStarted({ ...mission, objectives, progress }, run)) ? "active" : "available";
    return { ...mission, objectives, progress, state, nodeCode: missionStatusLabels[state] };
  });
  return { ...current, missions, missionRuns: Object.fromEntries(Object.entries(current.missionRuns).map(([id, run]) => [id, id !== current.selectedMissionId || missions.find((mission) => mission.id === id)?.state === "completed" ? { ...run, open: false } : run])) };
}
export function selectCampaignMission(current: CampaignState, id: string): CampaignState {
  if (!current.missions.some((mission) => mission.id === id && mission.state !== "locked")) return current;
  return synchronizeCampaign({ ...current, selectedMissionId: id });
}
export function unlockProgression(missions: Mission[]) {
  return missions.map((mission, index) => mission.state === "locked" && (index === 0 || missions[index - 1].state === "completed") ? { ...mission, state: "available" as const, nodeCode: "Available" } : mission);
}
export function loadCampaign(saved: Partial<CampaignState> & { missionRun?: MissionRunState } | null): CampaignState {
  let missions = initialMissions.map((base) => {
    const stored = saved?.missions?.find((mission) => mission.id === base.id);
    if (!stored) return { ...base, objectives: base.objectives.map((objective) => ({ ...objective })) };
    return { ...base, state: stored.state ?? base.state, progress: stored.progress ?? base.progress, nodeCode: base.nodeCode,
      objectives: base.objectives.map((objective) => ({ ...objective, complete: stored.state === "completed" || !!stored.objectives?.find((item) => item.id === objective.id)?.complete })) };
  });
  missions = unlockProgression(missions);
  const missionRuns = Object.fromEntries(campaignOrder.map((id) => {
    // The old single run always belonged to Northwind, even when another map node was selected.
    const old = saved?.missionRuns?.[id] ?? (id === "northwind" ? saved?.missionRun : undefined);
    return [id, { ...freshRun(), ...old, answers: { ...old?.answers }, attempts: { ...old?.attempts }, completedTasks: [...(old?.completedTasks ?? [])], academyWork: { ...initialMissionRun.academyWork, ...old?.academyWork } }];
  }));
  // Older releases shared one run across routes. Rehome namespaced evidence,
  // including schema-2 saves that previously assigned that run to Northwind.
  const owner = (task: string) => task.startsWith("base-camp-") ? "base-camp" : task.startsWith("cedar-") ? "cedar-pass" : task.startsWith("glacier-") ? "glacier-relay" : task.startsWith("echo-") ? "echo-canyon" : null;
  for (const [id, run] of Object.entries(missionRuns)) {
    for (const task of new Set([...run.completedTasks, ...Object.keys(run.answers), ...Object.keys(run.attempts)])) {
      const destination = owner(task);
      if (!destination || destination === id) continue;
      const target = missionRuns[destination];
      if (run.completedTasks.includes(task)) target.completedTasks = [...new Set([...target.completedTasks, task])];
      if (run.answers[task] !== undefined && target.answers[task] === undefined) target.answers = { ...target.answers, [task]: run.answers[task] };
      if (run.attempts[task] !== undefined) target.attempts = { ...target.attempts, [task]: Math.max(target.attempts[task] ?? 0, run.attempts[task]) };
      run.completedTasks = run.completedTasks.filter((item) => item !== task);
      run.answers = Object.fromEntries(Object.entries(run.answers).filter(([key]) => key !== task));
      run.attempts = Object.fromEntries(Object.entries(run.attempts).filter(([key]) => key !== task));
    }
  }
  // Credit equivalent earned activities, not the old supplies exercise as an area calculation.
  const camp = missionRuns["base-camp"];
  for (const [legacy, objective] of [["base-camp-site", "b1"], ["base-camp-organize", "b3"]]) {
    if (camp.completedTasks.includes(legacy)) camp.completedTasks = [...new Set([...camp.completedTasks, objective])];
  }
  missions = unlockProgression(missions.map((mission, index) => {
    const run = missionRuns[mission.id];
    const earned = missionHasStarted(mission, run);
    // Discard old catalog-only unlocks/active flags; never discard earned progress.
    return index > 0 && mission.state !== "completed" && missions[index - 1].state !== "completed" && !earned
      ? { ...mission, state: "locked" as const } : mission;
  }));
  const inventory = initialInventory.map((base) => ({ ...base, ...saved?.inventory?.find((item) => item.id === base.id) }));
  inventory.push(...(saved?.inventory?.filter((item) => item.custom && !inventory.some((base) => base.id === item.id)) ?? []));
  const selectedMissionId = missions.some((mission) => mission.id === saved?.selectedMissionId && mission.state !== "locked") ? saved.selectedMissionId : (missions.find((mission) => mission.state === "active" || mission.state === "available") ?? missions[0]).id;
  return synchronizeCampaign({ missions, selectedMissionId, inventory,
    notes: (saved?.notes ?? initialNotes).map((note, index) => ({ ...note, createdAt: note.createdAt ?? index + 1, important: note.important ?? false })),
    missionRuns, lab: { relayPrepared: inventory.some((item) => item.id === "relay" && item.available), experimentCompleted: false, ...saved?.lab } });
}
export function updateRun(current: CampaignState, id: string, update: (run: MissionRunState) => MissionRunState): CampaignState {
  const run = update(current.missionRuns[id]);
  const missions = current.missions.map((mission) => {
    if (mission.id !== id || mission.state === "completed" || id !== "northwind") return mission;
    const objectives = mission.objectives.map((objective) => northwindRequirements[objective.id]?.every((task) => run.completedTasks.includes(task)) ? { ...objective, complete: true } : objective);
    return { ...mission, objectives, progress: Math.max(mission.progress, Math.floor(objectives.filter((objective) => objective.complete).length / objectives.length * 95)) };
  });
  return synchronizeCampaign({ ...current, missionRuns: { ...current.missionRuns, [id]: run }, missions });
}
export function completionBlocker(current: CampaignState, id: string): string | null {
  const mission = current.missions.find((item) => item.id === id);
  if (!mission || mission.state === "locked") return "This mission is locked.";
  if (mission.state === "completed") return null;
  if (!mission.objectives.every((objective) => objective.complete)) return "Complete every mission objective before finishing.";
  if (id === "northwind" && !northwindRequiredTasks.every((task) => task === "asl" ? aslCheckpointComplete(current.missionRuns[id].completedTasks) : current.missionRuns[id].completedTasks.includes(task))) return "Complete every Northwind checkpoint before finishing.";
  if (!suppliesReady(mission, current.inventory)) return "Pack every required supply with a positive quantity before finishing.";
  return null;
}
export function completeMission(current: CampaignState, id: string): CampaignState {
  const mission = current.missions.find((item) => item.id === id);
  if (!mission || mission.state === "completed" || completionBlocker(current, id)) return current;
  const missions = unlockProgression(current.missions.map((item) => item.id === id ? { ...item, state: "completed" as const, progress: 100, nodeCode: id === "northwind" ? "Station Restored" : "Completed" } : item));
  return synchronizeCampaign({ ...current, missions, missionRuns: { ...current.missionRuns, [id]: { ...current.missionRuns[id], open: false, stage: "summary" } } });
}
