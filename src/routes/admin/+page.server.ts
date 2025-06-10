import {deleteQuiz, getCurrentQuiz, getQuizzes, makeCurrentQuiz} from "$lib/server/db";
import type {PageServerLoad} from "./$types";
import {type Actions, redirect} from "@sveltejs/kit";

export const load = (() => {
    const quizzes = getQuizzes();
    return {
        quizzes,
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    delete: async ({request}) => {
        const data = await request.formData();
        const quiz_id = data.get('slug')?.toString();
        if (quiz_id) {
            await deleteQuiz(quiz_id);
        }
    },
    edit: async ({request}) => {
        const data = await request.formData();
        const quiz_id = data.get('slug')?.toString();
        redirect(303, `/admin/edit/${quiz_id}`);
    },
    make_current: async ({request}) => {
        const current_quiz = getCurrentQuiz();
        const data = await request.formData();
        const quiz_id = data.get('slug')?.toString();
        if (current_quiz) {
            await makeCurrentQuiz(current_quiz.id, 0);
        }
        if (quiz_id) {
            await makeCurrentQuiz(quiz_id, 1);
        }
    },
    unmake_current: async ({request}) => {
        const data = await request.formData();
        const quiz_id = data.get('slug')?.toString();
        if (quiz_id) {
            await makeCurrentQuiz(quiz_id, 0);
        }
    }
}