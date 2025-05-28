import {
    createQuestion,
    createQuestionField,
    getRound,
    getRoundTemplate,
} from '$lib/server/db'
import type {PageServerLoad} from './$types';
import {type Actions, redirect} from "@sveltejs/kit";
import type {Question} from "$lib/server/db/types";

import {_rounds} from '../../../../../create/+page.server'

let slug = '';
let round_number: number;
export const actions: Actions = {
    submit: async ({request}) => {
        const data = await request.formData();
        const questions_str = data.getAll('questions').toString();
        const questions: Question[] = JSON.parse(questions_str);
        console.log(questions);
        for (const question of questions) {
            let question_id = <number>await createQuestion(question.round_id);
            for (const field of question.questionFields) {
                await createQuestionField(question_id, field);
            }
        }
        console.log(_rounds);
        if (round_number + 1 <= _rounds.length) {
            console.log(round_number, _rounds[round_number - 1]);
            if (_rounds[round_number].round_template_id != 'null'){
                throw redirect(303, `/admin/edit/${slug}/round/${round_number + 1}/questions`);
            }
            else {
                throw redirect(303, `/admin/edit/${slug}/round/${round_number + 1}/new`);
            }
        }
        else{
            redirect(303, '/admin');
        }
    }
}

export const load = (({params}) => {
    const round = getRound(params.slug, parseInt(params.round_id));
    const round_template = getRoundTemplate(round.round_template_id);
    slug = params.slug;
    round_number = parseInt(params.round_id);
    return {
        round_template,
        round,
        slug,
    };
}) satisfies PageServerLoad;
