// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.4/src/edge-runtime.d.ts" />

import { fetchMessages, insertMessage } from "../_queries/messages.query.ts";
import { fetchPlayers, updatePlayer } from "../_queries/players.query.ts";
import { fetchRoom, updateRoom } from "../_queries/room.query.ts";
import { corsHeaders } from "../_utils/cors.ts";
import { setRandomPlayerAsBotAndResetVotes } from "../_utils/vote.ts";
import { createSupabaseClient } from "../_utils/supabase.ts";
import { isNotSystem, nextVoteLength, pickRandom } from "../_shared/utils.ts";
import { iceBreakers } from "../_shared/lang.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { roomId, playerId, vote } = (await req.json()) as {
      roomId: string;
      playerId: string;
      vote: string;
    };
    if (!roomId) throw new Error("Missing roomId");
    if (!playerId) throw new Error("Missing playerId");
    if (!vote) throw new Error("Missing vote");

    const supabase = createSupabaseClient(req);

    console.log("Voting", { roomId, playerId });

    // Apply player vote
    if (vote === "blank") {
      await updatePlayer(supabase, {
        id: playerId,
        room_id: roomId,
        vote: null,
        vote_blank: true,
      });
    } else {
      await updatePlayer(supabase, {
        id: playerId,
        room_id: roomId,
        vote,
        vote_blank: false,
      });
    }
    const [players, messages] = await Promise.all([
      fetchPlayers(supabase, roomId),
      fetchMessages(supabase, roomId),
    ]);

    const numHumans = players.filter((player) => !player.is_bot).length;
    const botPlayer = players.find((player) => player.is_bot);
    const botVoters = players.filter((player) => player.vote === botPlayer?.id);
    const blankVoters = players.filter((player) => player.vote_blank === true);
    const numVotes = players.filter(
      (player) => player.vote || player.vote_blank,
    ).length;

    // All players have voted
    if (numVotes >= numHumans) {
      console.log("All players have voted", roomId);

      // give time to read results
      await new Promise((resolve) => setTimeout(resolve, 8000));

      // +1 point for those who voted for the bot
      if (botPlayer) {
        await Promise.all(
          botVoters.map((winner) =>
            updatePlayer(supabase, {
              id: winner.id,
              room_id: roomId,
              score: winner.score + 1,
            })
          ),
        );
      }
      // +1 point for the bot if nobody voted for it
      if (botPlayer && !botVoters.length) {
        await updatePlayer(supabase, {
          id: botPlayer.id,
          room_id: roomId,
          score: botPlayer.score + 1,
        });
      }
      if (!botPlayer) {
        // +1 point for those who voted for blank
        await Promise.all(
          blankVoters.map((winner) =>
            updatePlayer(supabase, {
              id: winner.id,
              room_id: roomId,
              score: winner.score + 1,
            })
          ),
        );
      }

      // Post message in chat
      let message = "";

      if (botPlayer && botVoters.length) {
        // bot was found
        message = `+1 🧠 for ${
          botVoters
            .map((p) => p.name)
            .join(" and ")
        } who exorcised ${botPlayer?.name} the possessed `;
      }
      if (botPlayer && !botVoters.length) {
        // bot escaped
        message = `+1 🧠 for ${botPlayer?.name} the possessed who escaped`;
      }
      if (!botPlayer && blankVoters.length) {
        // people guessed there was no bot
        message = `+1 🧠 for ${
          blankVoters
            .map((p) => p.name)
            .join(" and ")
        } who realized that nobody was possessed`;
      }
      if (!botPlayer && !blankVoters.length) {
        // nobody guessed there was no bot
        message = `Nobody guessed that nobody was possessed 😏`;
      }

      await insertMessage(supabase, {
        author: "system",
        content: message,
        room_id: roomId,
      });

      const playersAfter = await fetchPlayers(supabase, roomId);

      const maxScore = Math.max(...playersAfter.map((p) => p.score));

      if (maxScore >= 5) {
        // Game over
        console.log("Game over", roomId);
        // Announce winner
        const winners = playersAfter.filter((p) => p.score === maxScore);
        if (winners.length) {
          const message = `${winners.map((w) => w.name).join(" and ")} won! 🏆`;
          await insertMessage(supabase, {
            author: "system",
            content: message,
            room_id: roomId,
          });
        }
        // Close the room
        await updateRoom(supabase, roomId, { status: "over" });
      } else {
        // Next round
        console.log("Next round", roomId);

        // set next vote
        const room = await fetchRoom(supabase, roomId);
        const nextVote = messages.filter(isNotSystem).length +
          nextVoteLength(players.length);

        // Reset votes and set random player as bot
        await Promise.all([
          setRandomPlayerAsBotAndResetVotes(supabase, players),
          updateRoom(supabase, roomId, {
            status: "talking",
            last_vote: room?.next_vote,
            next_vote: nextVote,
          }),
          insertMessage(supabase, {
            room_id: roomId,
            author: "intro",
            content: "💡 " + pickRandom(iceBreakers[room?.lang ?? "en"]),
          }),
        ]);
      }
    }

    const data = {};

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
