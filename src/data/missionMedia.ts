export const missionMedia = {
  asl: {
    whereAreYouFrom: "/video/mission-actions/Where%20are%20you%20from_.mp4",
    whatsWrong: "/video/mission-actions/What's%20wrong_.mp4",
  },
  actions: { makeFire: "/video/mission-actions/make-a-fire.mp4" },
} as const;
export const aslRounds = [
  // Keep the original round ID so completed checkpoints survive the media change.
  {
    id: "asl-need-help",
    prompt: "What does ‘Do you need help?’ mean?",
    options: [
      "The person wants you to assist them.",
      "The person is checking whether they can assist you.",
      "The person wants to know where you are going.",
      "The person is asking whether the task is finished.",
    ],
    answer: "The person is checking whether they can assist you.",
  },
  { id: "asl-where-from", video: missionMedia.asl.whereAreYouFrom, prompt: "What question is being signed?", options: ["How are you?", "Where are you from?", "Are you deaf or hearing?"], answer: "Where are you from?" },
  { id: "asl-whats-wrong", video: missionMedia.asl.whatsWrong, prompt: "What does the signer ask?", options: ["What's wrong?", "Nice to meet you.", "I'm fine."], answer: "What's wrong?" },
];
