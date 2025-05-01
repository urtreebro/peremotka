import {getQuizzes} from "$lib/server/db";
import type {PageServerLoad} from "./$types";

export const load = (() => {
    const quizzes = getQuizzes();
    return {
        quizzes,
    };
}) satisfies PageServerLoad;