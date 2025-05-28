export const fr = {
  messages: {
    // Game start/setup
    warmupPhaseMessage:
      "💬 Discutons un peu avant que l'IA prenne le contrôle d'un joueur...",
    joinedGame: "👋 {{player}} a rejoint la partie",

    // Warmup to Hunt transition
    huntPhaseAnnouncement: "🤖 L'IA a pris le contrôle de quelqu'un !",
    huntPhaseInstructions:
      "💡 Discutez pour identifier l'IA, puis lancez un vote 🗳️",

    // Vote phase
    startedVote: "{{player}} a commencé un vote",
    voteInstructionsHunting: "💡 Trouvez qui est l'IA pour gagner un 🧠",
    voteInstructionsDeception:
      "💡 Convainquez les autres de voter pour un humain et ils perdent un 🧠",

    // Results/Scoring
    voteResultsAnnouncement: "Les résultats sont là !",
    aiIdentityReveal: "Et l'IA était...",
    revealedPlayerName: "{{player}}",
    noAiThisRound: "Personne",
    foundAI: "+1 🧠 pour {{player}} qui a trouvé l'IA 🤖",
    wronglyAccusedHuman:
      "-1 🧠 pour {{player}} qui a pensé que {{accused}} était l'IA 🎭",
    realizedNoAI:
      "+1 🧠 pour {{player}} qui a réalisé qu'il n'y avait pas d'IA ❌",
    missedAI: "-1 🧠 pour {{player}} qui pensait qu'il n'y avait pas d'IA",

    // Game flow/Round transitions
    roundEndNewTopic: "L'IA est partie, changeons de sujet",
    playersWon: "{{players}} a gagné ! 🏆",
    tieAtWinningScore: "🤝 Égalité à {{score}} 🧠 ! On continue...",
  },
};
