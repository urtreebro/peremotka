import {getBlanks, getCurrentQuiz, getRounds} from "$lib/server/db";
import type {Blank} from "$lib/server/db/types";
import type {PageServerLoad} from "./$types";
import type {Actions} from "@sveltejs/kit";

export const load = (() => {
    const current_quiz = getCurrentQuiz();
    const rounds_blanks: Blank[][] = [];
    if (current_quiz) {
        current_quiz.rounds = getRounds(current_quiz.id);
        current_quiz.rounds.sort((a, b) => a.round_number - b.round_number);
        rounds_blanks.length = current_quiz.rounds.length;
        const order = ['Не проверен', 'Проверен', 'Не сдан']
        for (const round of current_quiz.rounds) {
            rounds_blanks[round.round_number - 1] = getBlanks(round.round_id);
            rounds_blanks[round.round_number - 1].sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));
        }
    }

    return {
        current_quiz,
        rounds_blanks,
    }
}) satisfies PageServerLoad
