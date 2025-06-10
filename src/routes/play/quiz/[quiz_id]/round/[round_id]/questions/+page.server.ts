import type {PageServerLoad} from "./$types";
import {
    changeBlankState,
    createAnswer,
    createAnswerField,
    createBlank, getMapTemplate,
    getQuizLength,
    getRound,
    getRoundTemplate
} from "$lib/server/db";
import {type Actions, redirect} from "@sveltejs/kit";
import type {Answer, MapTemplate, Template} from "$lib/server/db/types";

let round_number: number;
let slug: string;
let blank_id: number;
let template: Template;

export const actions: Actions = {
    submit: async ({request, locals}) => {
        const data = await request.formData();
        const answers_str = data.getAll('answers').toString();
        const answers: Answer[] = JSON.parse(answers_str);
        await changeBlankState(blank_id, "Не проверен");
        for (const answer of answers) {
            let answer_id = <number>await createAnswer(answer.blank_id, '');
            for (const field of answer.answer_fields) {
                await createAnswerField(answer_id, field.answer, 1);
            }
        }

        if (template.specials === 'geography') {
            const numbers = data.getAll('numbers').toString();

            interface NumberAssignment {
                number: number;
                pointId: number | null;
            }

            const numbers_parsed = JSON.parse(numbers) as NumberAssignment[];
            let answer_id = <number>await createAnswer(blank_id, 'geography');
            for (const num of numbers_parsed) {
                await createAnswerField(answer_id, `${num.number},${num.pointId}`, 1);
            }
        }
        const quiz_length = getQuizLength(slug);
        if (round_number + 1 <= quiz_length) {
            throw redirect(303, `/play/quiz/${slug}/round/${round_number + 1}/questions`);
        }
        else {
            locals.completed = true;
            redirect(303, '/play/results');
        }
    }
}

export const load = (async ({params, locals: {username}}) => {
    const round = getRound(params.quiz_id, parseInt(params.round_id));
    slug = params.quiz_id;
    round_number = parseInt(params.round_id);
    // @ts-ignore
    blank_id = <number>await createBlank(slug, round.round_id, username, "Не сдан");
    template = getRoundTemplate(round.round_template_id);
    let map_template: MapTemplate = {id: '', title: '', points: []};
    if (template.specials === 'geography') {
        map_template = getMapTemplate(template.content);
        console.log(map_template);
    }
    return {
        round,
        slug,
        template,
        blank_id,
        map_template,
    };
}) satisfies PageServerLoad;