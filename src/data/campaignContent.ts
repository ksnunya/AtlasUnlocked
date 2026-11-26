import { aslRounds } from "./missionMedia";
import type { InventoryItem, FieldNote, Mission } from "./gameData";
import type { MissionRunState } from "./missionContent";

export const campaignOrder = ["base-camp", "cedar-pass", "northwind", "glacier-relay", "echo-canyon"];
export interface CampaignTask {
  id: string;
  brief: string;
  prompt: string;
  kind: "choice" | "number" | "action";
  options?: string[];
  answer: string;
  actionLabel?: string;
  needsNote?: boolean;
  needsSupplies?: boolean;
  needsRelay?: boolean;
  hints: string[];
}
export const campaignTasks: Record<string, CampaignTask[]> = {
  "base-camp": [
    { id: "b1", brief: "Survey South Alder Basin. The creek bank is low and muddy; the western slope is steep. A flat clearing above the creek has room for camp.", prompt: "Where should you establish camp? Record a site observation in the Notebook before confirming.", kind: "choice", options: ["Low creek bank", "Steep western slope", "Flat clearing above the creek"], answer: "Flat clearing above the creek", needsNote: true, hints: ["Keep camp above floodwater.", "Choose flat ground, away from the creek bank.", "The flat clearing above the creek is the safe site."] },
    { id: "b2", brief: "Mark a rectangular safe zone that is 4 meters long and 3 meters wide.", prompt: "What is the safe zone area in square meters?", kind: "number", answer: "12", hints: ["Find the area of a rectangle.", "Multiply length by width.", "4 times 3 is 12 square meters."] },
    { id: "b3", brief: "Organize the notebook, pencils, and water bottle where you can reach them. Mark each required supply available and packed.", prompt: "Confirm the essential camp supplies are organized.", kind: "action", answer: "organized", actionLabel: "Organize supplies", needsSupplies: true, hints: ["Check Inventory for the required camp supplies.", "Every required supply must be available, have a positive quantity, and be packed.", "Pack the notebook, pencil, and water bottle, then organize supplies."] },
  ],
  "cedar-pass": [
    { id: "c1", brief: "The route from Base Camp reaches an eastern marker. East is a bearing of 090 degrees; west is 270 degrees.", prompt: "Which bearing leads to the eastern marker?", kind: "choice", options: ["270 degrees", "090 degrees", "180 degrees"], answer: "090 degrees", hints: ["Find east on the compass.", "North is 000 degrees; east is a quarter turn clockwise.", "The eastward bearing is 090 degrees."] },
    { id: "c2", brief: "The trail measures 3 centimeters on the map. The map scale is 1 centimeter to 2 kilometers.", prompt: "How far is the trail in kilometers?", kind: "number", answer: "6", hints: ["Use the map scale.", "Multiply 3 centimeters by 2 kilometers per centimeter.", "The trail is 6 kilometers long."] },
    { id: "c3", brief: "At the fork, the east ridge stays above the creek and reaches the eastern marker. The west path turns back. Pack ruler, water, and notebook, and record your route observation.", prompt: "Choose the route that reaches the eastern marker safely.", kind: "choice", options: ["West path back to camp", "East ridge to the marker", "Flooded creek shortcut"], answer: "East ridge to the marker", needsNote: true, needsSupplies: true, hints: ["Follow the plotted eastward route.", "Avoid the flooded shortcut; keep your mission supplies packed.", "Choose the east ridge, with a new notebook observation and packed ruler, water, and notebook."] },
  ],
  "glacier-relay": [
    { id: "g1", brief: "The western ascent is shorter, but closely spaced contour lines show a steep climb. The eastern ridge is longer with widely spaced contours.", prompt: "Which ascent is safer for carrying the replacement relay?", kind: "choice", options: ["Short steep western ascent", "Gentle eastern ridge", "Unmarked ice gully"], answer: "Gentle eastern ridge", hints: ["Compare the contour spacing.", "Widely spaced contours mean a gentler slope.", "Carry the relay along the gentle eastern ridge."] },
    { id: "g2", brief: "The temperature is 7 degrees C and falls 2 degrees each hour. The safe departure window ends at 1 degree C.", prompt: "How many hours remain in the weather window?", kind: "number", answer: "3", hints: ["Find the temperature difference.", "There are 6 degrees between 7 and 1; divide by 2 degrees per hour.", "The weather window lasts 3 hours."] },
    { id: "g3", brief: "Prepare the replacement signal relay in the Field Lab, then pack it with the radio, water, and ruler. At the highland tower, fit it into the relay bracket.", prompt: "Install the prepared relay at the highland tower.", kind: "action", answer: "installed", actionLabel: "Install relay", needsRelay: true, needsSupplies: true, hints: ["Use the Field Lab equipment section to prepare the relay.", "Northwind must be restored; pack the prepared relay and all Glacier supplies.", "Prepare the signal relay in the lab, pack it in Inventory, then install it."] },
    { id: "g4", brief: "The tower now passes 3 signal checks out of 3. A ratio of successful checks to all checks confirms the link.", prompt: "What fraction of the signal checks succeeded? Enter a decimal number.", kind: "number", answer: "1", hints: ["Divide successful checks by all checks.", "The ratio is 3 divided by 3.", "Enter 1: every signal check succeeded."] },
  ],
  "echo-canyon": [
    { id: "e1", brief: "The narrow western slot blocks the radio signal. The wider eastern ledge has stable footing and a clear connection.", prompt: "Choose a safe entry into the canyon.", kind: "choice", options: ["Narrow western slot", "Wide eastern ledge", "Loose cliff edge"], answer: "Wide eastern ledge", hints: ["Keep safe footing and radio contact.", "The western slot blocks signals; the eastern ledge is wider.", "Enter along the wide eastern ledge."] },
    { id: "e2", brief: "Survey a rectangular section of the narrows: length 6 meters, width 4 meters. Record the dimensions and safe route in a new field note. Pack notebook, ruler, and radio.", prompt: "What is the surveyed area in square meters?", kind: "number", answer: "24", needsNote: true, needsSupplies: true, hints: ["Record the dimensions in the Notebook.", "Area is length times width; all survey gear must be packed.", "6 times 4 is 24 square meters. Save a new mission observation before confirming."] },
  ],
};
export const northwindRequirements: Record<string, string[]> = {
  n1: ["reading-direction", "reading-hazard", "trail-note"], n2: ["area", "mass"],
  n3: ["station-inspection"], n4: ["station-repair"], n5: ["science", "station-note"],
};
export const northwindRequiredTasks = Object.values(northwindRequirements).flat().concat("asl");
export function aslCheckpointComplete(tasks: string[]) {
  return tasks.includes("asl") || aslRounds.every((round) => tasks.includes(round.id));
}
export function suppliesReady(mission: Mission, inventory: InventoryItem[]) {
  return mission.supplyIds.every((id) => inventory.some((item) => item.id === id && item.available && item.packed && Number.parseFloat(item.quantity) > 0));
}
export function newMissionNote(mission: Mission, run: MissionRunState, notes: FieldNote[]) {
  return notes.some((note) => note.missionId === mission.id && (run.noteBaselineIds ? !run.noteBaselineIds.includes(note.id) : notes.length > run.noteBaseline));
}
export function taskRequirement(task: CampaignTask, mission: Mission, run: MissionRunState, inventory: InventoryItem[], notes: FieldNote[], relayPrepared: boolean) {
  if (task.needsNote && !newMissionNote(mission, run, notes)) return "Save a new mission observation in the Notebook first.";
  if (task.needsSupplies && !suppliesReady(mission, inventory)) return "Make every required supply available, set a positive quantity, and pack it first.";
  if (task.needsRelay && !relayPrepared) return "Prepare the signal relay in the Field Lab first.";
  return null;
}
export function correctTaskAnswer(task: CampaignTask, answer: string) {
  return task.kind === "number" ? answer.trim() !== "" && Number(answer) === Number(task.answer) : answer === task.answer;
}
