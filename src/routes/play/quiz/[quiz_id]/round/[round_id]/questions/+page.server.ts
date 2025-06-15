import type {PageServerLoad} from "./$types";
import {
    changeBlankState, checkBlankExistence,
    createAnswer,
    createAnswerField,
    createBlank, getBlankId, getBlankState, getMapTemplate,
    getQuizLength,
    getRound,
    getRoundTemplate
} from "$lib/server/db";
import {type Actions, redirect} from "@sveltejs/kit";
import type {Answer, MapTemplate, Round, Template} from "$lib/server/db/types";

let round_number: number;
let slug: string;
let blank_id: number;
let template: Template;
let round: Round;

export const actions: Actions = {
    submit: async ({request, locals: {username}}) => {
        const data = await request.formData();
        const answers_str = data.getAll('answers').toString();
        const answers: Answer[] = JSON.parse(answers_str);
        const state = getBlankState(username!, round.round_id);
        if (state !== 'Не сдан') {
            const quiz_length = getQuizLength(slug);
            if (round_number + 1 <= quiz_length) {
                throw redirect(303, `/play/quiz/${slug}/round/${round_number + 1}/questions`);
            }
            else {
                redirect(303, '/play/results');
            }
        }
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
            redirect(303, '/play/results');
        }
    }
}

export const load = (async ({params, locals: {username}}) => {
    round = getRound(params.quiz_id, parseInt(params.round_id));
    slug = params.quiz_id;
    round_number = parseInt(params.round_id);
    if (!username) return;
    if (!checkBlankExistence(username, round.round_id)) {
        blank_id = <number>await createBlank(slug, round.round_id, username, "Не сдан");
    }
    else {
        blank_id = getBlankId(username, round.round_id);
        const state = getBlankState(username, round.round_id);
        if (state !== 'Не сдан') {
            const quiz_length = getQuizLength(slug);
            if (round_number + 1 <= quiz_length) {
                redirect(303, `/play/quiz/${slug}/round/${round_number + 1}/questions`);
            }
            else {
                redirect(303, '/play/results');
            }
        }
    }
    template = getRoundTemplate(round.round_template_id);
    let map_template: MapTemplate = {id: '', title: '', points: []};
    if (template.specials === 'geography') {
        map_template = getMapTemplate(template.content);
    }
    return {
        round,
        slug,
        template,
        blank_id,
        map_template,
    };
}) satisfies PageServerLoad;