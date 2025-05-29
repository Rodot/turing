export const en = {
  messages: {
    // Game start/setup
    warmupPhaseMessage:
      "💬 Let's chat a bit before the AI takes control of a player...",
    joinedGame: "👋 {{player}} has joined the game",

    // Warmup to Hunt transition
    huntPhaseAnnouncement: "🤖 The AI took control of someone!",
    huntPhaseInstructions:
      "💡 Investigate to identify the AI, then start a vote 🗳️",

    // Vote phase
    startedVote: "{{player}} started a vote",
    voteInstructionsHunting: "💡 Vote for the AI to earn a 🧠",
    voteInstructionsDeception: "💡 Pretend to be the AI to earn a 🧠",

    // Results/Scoring
    voteResultsAnnouncement: "Results are in!",
    aiIdentityReveal: "And the AI was...",
    revealedPlayerName: "{{player}}",
    noAiThisRound: "Nobody",
    foundAI: "+1 🧠 for {{player}} who found the AI 🤖",
    wronglyAccusedHuman:
      "No 🧠 for {{player}} who thought {{accused}} was the AI 🎭",
    realizedNoAI: "+1 🧠 for {{player}} who realized there was no AI ❌",
    missedAI: "No 🧠 for {{player}} who thought there was no AI",
    mostVotedHuman: "+1 🧠 for {{player}} who passed as the AI 🎭",
    invisibleAI: "+2 🧠 for {{player}} who perfectly blended in 🥷",

    // Game flow/Round transitions
    roundEndNewTopic: "The AI is gone, let's change the topic",
    playersWon: "{{players}} won! 🏆",
    tieAtWinningScore:
      "🤝 It's a tie at {{score}} 🧠! Starting another round...",
  },
};
