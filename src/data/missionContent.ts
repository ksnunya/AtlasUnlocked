export type MissionStage = "intro" | "supplies" | "academy" | "route" | "trailhead" | "asl" | "cache" | "station" | "summary" | "objectives";
export type AcademyStatus = Record<string, boolean>;

export interface MissionRunState {
  open: boolean;
  started?: boolean;
  objectiveIndex?: number;
  aslRoundIndex?: number;
  noteBaselineIds?: string[];
  stationNoteBaselineIds?: string[];
  stage: MissionStage;
  supplyReviewed: boolean;
  academyWork: AcademyStatus;
  answers: Record<string, string>;
  attempts: Record<string, number>;
  completedTasks: string[];
  inspectedSystems: string[];
  identifiedProblem: string;
  selectedTool: string;
  noteBaseline: number;
  stationNoteBaseline: number;
}

export const academyRequirements = [
  { id: "science", subject: "Physical Science", assignment: "Complete one assigned lesson or problem set" },
  { id: "geography", subject: "Introduction to Geography", assignment: "Complete one assigned geography lesson" },
  { id: "language", subject: "Grade 8 Language Arts", assignment: "Complete one assigned reading/language activity" },
  { id: "math", subject: "Pre-Algebra", assignment: "Complete one assigned math activity" },
  { id: "asl", subject: "American Sign Language I", assignment: "Complete one assigned ASL activity" },
];

export const missionBriefing = "Northwind Field Research Station has been offline since last night's storm. Travel northeast from the trailhead for 3.8 kilometers, following the blue ridge markers to the equipment cache and then the station. A washed-out section near Cedar Creek is the main hazard, so stay on the higher eastern trail. Carry your field radio, repair toolkit, and at least one full water bottle. The station's backup power indicator was last reported at 12 volts, but the antenna stopped transmitting soon afterward. At the cache, check the tarp and supply loads before climbing the final slope. Record short notes as you travel; the team needs clear observations, not copied paragraphs. Your goal is to inspect the station, identify the failed system, and restore safe communication before the weather changes.";

export const readingTask = {
  questions: [
    { id: "reading-direction", prompt: "Which direction should the explorer travel from the trailhead?", options: ["Southwest", "Northeast", "Due west"], answer: "Northeast" },
    { id: "reading-hazard", prompt: "What is the main route hazard?", options: ["A washed-out creek section", "Deep snow", "Falling rocks"], answer: "A washed-out creek section" },
  ],
  hints: ["Look for the route direction and the sentence naming the main hazard.", "The direction appears with the 3.8 km distance. The hazard is near Cedar Creek.", "Reasoning: the briefing says travel northeast and calls the washed-out section the main hazard."],
};

export const areaTask = { id: "area", prompt: "A repair tarp is 4 meters long and 3 meters wide. What is its area in square meters?", answer: "12", unit: "m²", hints: ["Area measures the surface inside a rectangle.", "Multiply length by width: 4 × 3.", "Worked explanation: 4 m × 3 m = 12 square meters."] };
export const massTask = { id: "mass", prompt: "The trail cart can carry at most 8 kg. Which supply load is safe?", options: ["Tool case: 9.2 kg", "Radio kit: 6.5 kg", "Battery crate: 11 kg"], answer: "Radio kit: 6.5 kg", hints: ["Compare each mass with the 8 kg limit.", "A safe load must be less than or equal to 8 kg.", "6.5 kg is below 8 kg; 9.2 kg and 11 kg are too heavy."] };
export const aslTask = { hints: ["For the text question, think about who is being offered assistance. For the videos, watch the signer’s whole phrase.", "The first question asks whether the listener could use assistance. Watch the signer’s expression in the next two rounds.", "The rounds mean: Do you need help? Where are you from? What's wrong?"] };
export const stationSystems = [
  { id: "power", name: "Backup Power", observation: "Indicator steady at 12 volts; battery housing is dry." },
  { id: "antenna", name: "Antenna Relay", observation: "Coaxial connector is loose and the relay bracket is bent." },
  { id: "weather", name: "Weather Sensor", observation: "Sensor display is online and reading 7°C." },
];
export const scienceTask = { id: "science", prompt: "Three sleeve materials were observed for 20 minutes. Which should protect a warm backup cell best?", observations: ["Thin foil: dropped 8°C", "Wool wrap: dropped 3°C", "Cotton cloth: dropped 6°C"], options: ["Thin foil", "Wool wrap", "Cotton cloth"], answer: "Wool wrap", hints: ["Better insulation loses less heat.", "Compare the temperature drops; choose the smallest drop.", "Wool dropped only 3°C, so it retained the most energy."], };

export const initialMissionRun: MissionRunState = {
  open: false, stage: "intro", supplyReviewed: false,
  academyWork: Object.fromEntries(academyRequirements.map((item) => [item.id, false])),
  answers: {}, attempts: {}, completedTasks: [], inspectedSystems: [], identifiedProblem: "", selectedTool: "", noteBaseline: 0, stationNoteBaseline: 0,
};

export const requiredMissionSupplies = ["notebook", "pencil", "ruler", "water", "radio", "toolkit"];
