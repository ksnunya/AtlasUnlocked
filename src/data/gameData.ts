import type { MissionNodeState } from "@/components/MissionNode";

export type ViewName = "Map" | "Missions" | "Skills" | "Notebook" | "Progress";
export type OverlayName = "lab" | "diagnostic" | "hints" | "complete" | "parent" | "tutorial" | "profile" | "today" | "inventory" | null;
export type NoteCategory = "Clues" | "Numbers" | "Places" | "Vocabulary" | "To Do";
export type PhysicalCategory = "Writing" | "Measurement" | "Science" | "Personal" | "School" | "Mission Gear";

export interface Mission {
  id: string;
  number: string;
  title: string;
  location: string;
  nodeLabel: string;
  nodeCode: string;
  state: Exclude<MissionNodeState, "lab">;
  objective: string;
  skills: string[];
  estimatedTime: string;
  supplyIds: string[];
  progress: number;
  objectives: { id: string; text: string; complete: boolean }[];
  hints: string[];
  x: string;
  y: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: string;
  category: "Physical" | "In-Game";
  physicalCategory?: PhysicalCategory;
  packed: boolean;
  available: boolean;
  optional: boolean;
  custom?: boolean;
  icon: "notebook" | "pencil" | "pen" | "ruler" | "water" | "calculator" | "radio" | "toolkit" | "battery" | "relay";
}

export interface FieldNote { id: string; category: NoteCategory; text: string; missionId?: string; createdAt: number; important: boolean }

export const initialMissions: Mission[] = [
  {
    id: "base-camp", number: "01", title: "Establish Base Camp", location: "South Alder Basin", nodeLabel: "Base Camp", nodeCode: "Available", state: "available",
    objective: "Choose safe ground, organize essential gear, and establish the expedition base.", skills: ["Area", "Organization", "Planning"], estimatedTime: "20–25 minutes", supplyIds: ["notebook", "pencil", "water"], progress: 0,
    objectives: [{ id: "b1", text: "Survey the basin", complete: false }, { id: "b2", text: "Mark the safe zone", complete: false }, { id: "b3", text: "Organize supplies", complete: false }],
    hints: ["Flat ground above the creek is less likely to flood.", "Sort gear by how quickly you may need it."], x: "13%", y: "70%",
  },
  {
    id: "cedar-pass", number: "02", title: "Cross Cedar Pass", location: "Western Ridge", nodeLabel: "Cedar Pass", nodeCode: "Locked", state: "locked",
    objective: "Use bearings and distance estimates to navigate through the mountain pass.", skills: ["Map reading", "Distance", "Directions"], estimatedTime: "25–30 minutes", supplyIds: ["ruler", "water", "notebook"], progress: 0,
    objectives: [{ id: "c1", text: "Plot the route", complete: false }, { id: "c2", text: "Calculate distance", complete: false }, { id: "c3", text: "Reach the eastern marker", complete: false }],
    hints: ["Contour lines close together indicate a steep climb.", "Check the map scale before estimating distance."], x: "36%", y: "56%",
  },
  {
    id: "northwind", number: "04", title: "Restore the Field Research Station", location: "Northwind Field Research Station", nodeLabel: "Research Station", nodeCode: "Locked", state: "locked",
    objective: "Travel to Northwind Field Research Station, assess the storm damage, and restore its emergency communications array.", skills: ["Reading", "Area", "Mass", "Science", "ASL"], estimatedTime: "35–45 minutes", supplyIds: ["notebook", "pencil", "ruler", "water", "radio", "toolkit"], progress: 0,
    objectives: [{ id: "n1", text: "Complete the Trailhead briefing", complete: false }, { id: "n2", text: "Organize the Equipment Cache", complete: false }, { id: "n3", text: "Inspect all station systems", complete: false }, { id: "n4", text: "Repair the antenna relay", complete: false }, { id: "n5", text: "Record a field observation", complete: false }],
    hints: ["Follow the task prompt closely and record short, specific field notes.", "Open Hints & Explanations during a task for three levels of support."], x: "57%", y: "43%",
  },
  {
    id: "glacier-relay", number: "05", title: "Glacier Relay", location: "Highland Ice Shelf", nodeLabel: "Glacier Relay", nodeCode: "Locked", state: "locked",
    objective: "Carry a replacement signal relay to the highland tower before the next storm arrives.", skills: ["Temperature", "Ratios", "Route planning"], estimatedTime: "30–40 minutes", supplyIds: ["relay", "radio", "water", "ruler"], progress: 0,
    objectives: [{ id: "g1", text: "Plan the safest ascent", complete: false }, { id: "g2", text: "Check the weather window", complete: false }, { id: "g3", text: "Install the new relay", complete: false }, { id: "g4", text: "Confirm the signal", complete: false }],
    hints: ["The western route is shorter, but its contour lines show a much steeper climb.", "A falling temperature can reduce battery life; pack a spare charge cell."], x: "89%", y: "17%",
  },
  {
    id: "echo-canyon", number: "06", title: "Echo Canyon Survey", location: "Southern Ravine", nodeLabel: "Echo Canyon", nodeCode: "Locked", state: "locked",
    objective: "Survey the canyon floor and map a safe route through its narrowest section.", skills: ["Area", "Scale", "Observation"], estimatedTime: "40 minutes", supplyIds: ["notebook", "ruler", "radio"], progress: 0,
    objectives: [{ id: "e1", text: "Enter the canyon", complete: false }, { id: "e2", text: "Survey the narrows", complete: false }],
    hints: ["Choose a route with enough space and a clear radio connection.", "Narrow canyon walls can interfere with radio signals."], x: "85%", y: "69%",
  },
];

export const initialInventory: InventoryItem[] = [
  { id: "notebook", name: "Notebook", quantity: "1", category: "Physical", physicalCategory: "Writing", packed: true, available: true, optional: false, icon: "notebook" },
  { id: "pencil", name: "Pencil", quantity: "2", category: "Physical", physicalCategory: "Writing", packed: true, available: true, optional: false, icon: "pencil" },
  { id: "pen", name: "Pen", quantity: "2", category: "Physical", physicalCategory: "Writing", packed: false, available: true, optional: true, icon: "pen" },
  { id: "ruler", name: "Ruler", quantity: "1", category: "Physical", physicalCategory: "Measurement", packed: false, available: true, optional: false, icon: "ruler" },
  { id: "water", name: "Water bottle", quantity: "1", category: "Physical", physicalCategory: "Personal", packed: false, available: true, optional: false, icon: "water" },
  { id: "calculator", name: "Small calculator", quantity: "1", category: "Physical", physicalCategory: "School", packed: true, available: true, optional: true, icon: "calculator" },
  { id: "radio", name: "Field radio", quantity: "1", category: "In-Game", packed: true, available: true, optional: false, icon: "radio" },
  { id: "toolkit", name: "Repair toolkit", quantity: "1", category: "In-Game", packed: true, available: true, optional: false, icon: "toolkit" },
  { id: "battery", name: "Charge cells", quantity: "4", category: "In-Game", packed: true, available: true, optional: true, icon: "battery" },
  { id: "relay", name: "Signal relay", quantity: "1", category: "In-Game", packed: false, available: false, optional: false, icon: "relay" },
];
