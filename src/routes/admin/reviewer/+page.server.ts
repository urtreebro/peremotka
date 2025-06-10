import {getCurrentQuiz} from "$lib/server/db";

export const load = () => {
    const current_quiz = getCurrentQuiz();
};