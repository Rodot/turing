export const fr = {
  messages: {
    // Game start/setup
    warmupPhaseMessage: "💬 Discutons un peu avant que l'IA n'arrive...",
    joinedGame: "👋 {{player}} a rejoint la partie",

    // Warmup to Hunt transition
    huntPhaseAnnouncement: "🤖 L'IA a pris le contrôle de quelqu'un !",
    huntPhaseInstructions:
      "💡 Enquêtez pour identifier l'IA, puis lancez un vote 🗳️",

    // Vote phase
    startedVote: "{{player}} a lancé un vote, dépêchez-vous !",

    // Results/Scoring
    aiIdentityReveal: "Les résultats sont là ! Et l'IA était...",
    revealedPlayerName: "{{player}}",
    noAiThisRound: "Personne",
    foundAI: "+1 🧠 pour {{player}} qui a trouvé l'IA 🤖",
    wronglyAccusedHuman:
      "Pas de 🧠 pour {{player}} qui a pensé que {{accused}} était l'IA 🎭",
    realizedNoAI:
      "+1 🧠 pour {{player}} qui a réalisé qu'il n'y avait pas d'IA ❌",
    missedAI: "Pas de 🧠 pour {{player}} qui pensait qu'il n'y avait pas d'IA",
    mostVotedHuman: "+1 🧠 pour {{player}} qui s'est fait passer pour l'IA 🎭",
    invisibleAI: "+2 🧠 pour {{player}} qui ne s'est pas fait remarquer 🥷",

    // Game flow/Round transitions
    roundEndNewTopic: "L'IA est partie, changeons de sujet",
    playersWon: "{{players}} a gagné ! 🏆",
    tieAtWinningScore: "🤝 Égalité à {{score}} 🧠 ! On continue...",
  },
};
