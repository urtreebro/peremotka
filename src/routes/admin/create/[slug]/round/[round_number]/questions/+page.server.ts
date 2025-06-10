import {
    createQuestion,
    createQuestionField, getMapTemplate, getNextRound, getQuizLength,
    getRound,
    getRoundTemplate,
} from '$lib/server/db'
import type {PageServerLoad} from './$types';
import {type Actions, redirect} from "@sveltejs/kit";
import type {MapTemplate, Question, Round, Template} from "$lib/server/db/types";


let slug = '';
let round_number: number;
let round_template: Template;
let round: Round;
export const actions: Actions = {
    submit: async ({request}) => {
        const data = await request.formData();
        const questions_str = data.getAll('questions').toString();
        const questions: Question[] = JSON.parse(questions_str);


        for (const question of questions) {
            let question_id = <number>await createQuestion(question.round_id, '');
            for (const field of question.question_fields) {
                await createQuestionField(question_id, field.correct_answer);
            }
        }

        if (round_template.specials === 'geography') {
            const numbers = data.getAll('numbers').toString();

            interface NumberAssignment {
                number: number;
                pointId: number | null;
            }

            const numbers_parsed = JSON.parse(numbers) as NumberAssignment[];
            let question_id = <number>await createQuestion(round.round_id, 'geography');
            for (const num of numbers_parsed) {
                await createQuestionField(question_id, `${num.number},${num.pointId}`);
            }
        }
        const quiz_length = getQuizLength(slug);
        console.log(quiz_length);
        if (round_number + 1 <= quiz_length) {
            const exists = getNextRound(slug, round_number + 1);
            if (exists !== 0) {
                throw redirect(303, `/admin/create/${slug}/round/${round_number + 1}/questions`);
            }
            else {
                throw redirect(303, `/admin/create/${slug}/round/${round_number + 1}/new`);
            }
        }
        else {
            redirect(303, '/admin');
        }
    }
}

export const load = (({params}) => {
    round = getRound(params.slug, parseInt(params.round_number));
    round_template = getRoundTemplate(round.round_template_id);
    let map_template: MapTemplate = {id: '', title: '', points: []};
    if (round_template.specials === 'geography') {
        map_template = getMapTemplate(round_template.content);
        console.log(map_template);
    }
    slug = params.slug;
    round_number = parseInt(params.round_number);
    return {
        round_template,
        round,
        slug,
        map_template,
    };
}) satisfies PageServerLoad;
