import {
    createQuestion,
    createQuestionField, getMapTemplate, getQuestions, getQuizLength,
    getRound,
    getRoundTemplate, updateQuestionField,
} from '$lib/server/db'
import type {PageServerLoad} from './$types';
import {type Actions, redirect} from "@sveltejs/kit";
import type {MapTemplate, Question, Round, Template} from "$lib/server/db/types";


let slug = '';
let round_number: number;
let round_template: Template;
let round: Round;
let questions: Question[];
export const actions: Actions = {
    submit: async ({request}) => {
        const data = await request.formData();
        const questions_str = data.getAll('questions').toString();
        const new_questions: Question[] = JSON.parse(questions_str);

        for (let i = 0; i < questions.length; ++i) {
            for (let j = 0; j < questions[i].question_fields.length; ++j) {
                if (questions[i].type == '') {
                    await updateQuestionField(questions[i].question_fields[j].id, new_questions[i].question_fields[j].correct_answer)
                }
            }
        }

        if (round_template.specials === 'geography') {
            const numbers = data.getAll('numbers').toString();

            interface NumberAssignment {
                number: number;
                pointId: number | null;
            }

            const numbers_parsed = JSON.parse(numbers) as NumberAssignment[];
            for (const num of numbers_parsed) {
                for (let i = 0; i < questions.length; ++i) {
                    for (let j = 0; j < questions[i].question_fields.length; ++j) {
                        if (questions[i].type === 'geography') {
                            const ans = questions[i].question_fields[j].correct_answer.split(',')[0];
                            if (parseInt(ans) === num.number) {
                                await updateQuestionField(questions[i].question_fields[j].id, `${num.number},${num.pointId}`);
                            }
                        }
                    }
                }
            }
        }
        const quiz_length = getQuizLength(slug);
        console.log(quiz_length);
        redirect(303, `/admin/edit/${slug}`)
    }
}

export const load = (({params}) => {
    round = getRound(params.slug, parseInt(params.round_id));
    round_template = getRoundTemplate(round.round_template_id);
    questions = getQuestions(round.round_id);

    let map_template: MapTemplate = {id: '', title: '', points: []};
    if (round_template.specials === 'geography') {
        map_template = getMapTemplate(round_template.content);
    }
    slug = params.slug;
    round_number = parseInt(params.round_id);
    return {
        round_template,
        round,
        slug,
        map_template,
        questions,
    };
}) satisfies PageServerLoad;
