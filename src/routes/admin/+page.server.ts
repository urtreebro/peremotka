import {deleteQuiz, getQuizzes} from "$lib/server/db";
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
        redirect(303, `/admin/edit/${quiz_id}/round/1/questions`);
    }
}