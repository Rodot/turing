export const en = {
  messages: {
    // Game start/setup
    warmupPhaseMessage:
      "💬 Let's chat a bit before the AI takes control of a player...",
    joinedGame: "👋 {{player}} has joined the game",

    // Warmup to Hunt transition
    huntPhaseAnnouncement: "🤖 The AI took control of someone!",
    huntPhaseInstructions: "💡 Chat to identify the AI, then start a vote 🗳️",

    // Vote phase
    startedVote: "{{player}} started a vote",
    voteInstructionsHunting: "💡 Vote for the AI to earn a 🧠",
    voteInstructionsDeception:
      "💡 Convince people to vote for a human and they lose a 🧠",

    // Results/Scoring
    voteResultsAnnouncement: "Results are in!",
    aiIdentityReveal: "And the AI was...",
    revealedPlayerName: "{{player}}",
    noAiThisRound: "Nobody",
    foundAI: "+1 🧠 for {{player}} who found the AI 🤖",
    wronglyAccusedHuman:
      "-1 🧠 for {{player}} who thought {{accused}} was an AI 🎭",
    realizedNoAI: "+1 🧠 for {{player}} who realized there was no AI ❌",
    missedAI: "-1 🧠 for {{player}} who thought there was no AI",

    // Game flow/Round transitions
    roundEndNewTopic: "The AI is gone, let's change the topic",
    playersWon: "{{players}} won! 🏆",
    tieAtWinningScore:
      "🤝 It's a tie at {{score}} 🧠! Starting another round...",
  },
};
