import type {PageServerLoad} from "./$types";
import {getQuiz, getRounds, getRoundTemplate, updateQuiz} from "$lib/server/db";
import type {Template} from "$lib/server/db/types";
import {type Actions, fail, redirect} from "@sveltejs/kit";

export const load = (({params}) => {
    const quiz_id = params.slug;
    const quiz = getQuiz(quiz_id);
    quiz.rounds = getRounds(quiz_id);
    console.log(quiz_id, quiz);
    let templates: Template[] = [];
    templates.length = quiz.length;
    for (const round of quiz.rounds) {
        templates[round.round_number - 1] = getRoundTemplate(round.round_template_id);
    }
    quiz.rounds.sort((a, b) => a.round_number - b.round_number);
    return {
        quiz,
        templates,
    };
}) satisfies PageServerLoad;


export const actions: Actions = {
    save: async ({request, params}) => {
        const data = await request.formData();
        const title = data.get('title')?.toString();
        if (title && params.slug) {
            await updateQuiz(params.slug, title)
            redirect(303, `/admin`);
        }
        else {
            return fail(400, {errorMessage: 'Введите название квиза'})
        }
    }
}