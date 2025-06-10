import {getCurrentQuiz} from "$lib/server/db";
import type {PageServerLoad} from "./$types";

export const load = (() => {
    const quiz = getCurrentQuiz();
    return {
        quiz: quiz,
    };
}) satisfies PageServerLoad;