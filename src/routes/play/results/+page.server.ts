import type {PageServerLoad} from "./$types";
import {getCurrentQuiz, getPlayersScores} from "$lib/server/db";

export const load = (async () => {
    const current_quiz = getCurrentQuiz();

    const players = getPlayersScores(current_quiz.id);

    players.sort((a, b) => b.score - a.score);

    return {
        current_quiz,
        players,
    };
}) satisfies PageServerLoad;