import {getCurrentQuiz} from "$lib/server/db";
import type {PageServerLoad} from "./$types";

export const load = (() => {
    const quiz = getCurrentQuiz();
    return {
        quiz: quiz[0],
    };
}) satisfies PageServerLoad;