export const en = {
  messages: {
    // Game start/setup
    warmupPhaseMessage: "💬 Let's chat a bit before the AI comes...",
    joinedGame: "👋 {{player}} has joined the game",

    // Warmup to Hunt transition
    huntPhaseAnnouncement: "🤖 The AI took control of someone!",
    huntPhaseInstructions:
      "💡 Investigate to identify the AI, then start a vote 🗳️",

    // Vote phase
    startedVote: "{{player}} started a vote, hurry up!",
    voteInstructionsHunting: "💡 Find the AI = +1 🧠",
    voteInstructionsDeception: "💡 Pass as the AI = +1 🧠",

    // Results/Scoring
    aiIdentityReveal: "Results are in! And the AI was...",
    revealedPlayerName: "{{player}}",
    noAiThisRound: "Nobody",
    foundAI: "+1 🧠 for {{player}} who found the AI 🤖",
    wronglyAccusedHuman:
      "No 🧠 for {{player}} who thought {{accused}} was the AI 🎭",
    realizedNoAI: "+1 🧠 for {{player}} who realized there was no AI ❌",
    missedAI: "No 🧠 for {{player}} who thought there was no AI",
    mostVotedHuman: "+1 🧠 for {{player}} who passed as the AI 🎭",
    invisibleAI: "+2 🧠 for {{player}} who didn't get noticed 🥷",

    // Game flow/Round transitions
    roundEndNewTopic: "The AI is gone, let's change the topic",
    playersWon: "{{players}} won! 🏆",
    tieAtWinningScore:
      "🤝 It's a tie at {{score}} 🧠! Starting another round...",
  },
};
