import type {PageServerLoad} from "./$types";
import {createAnswer, createAnswerField, getQuestions, getRound, getRounds} from "$lib/server/db";
import {type Actions, redirect} from "@sveltejs/kit";

export const actions: Actions = {
    submit: async ({request, locals}) => {
        const data = await request.formData();
        const answers = data.getAll('answers') as string[];
        const quiz_id = data.get('quiz_id')?.toString();
        const round_id = data.get('round_id')?.toString();
        const round_number = data.get('round_number')?.toString();
        const round_type = data.get('round_type')?.toString();
        const username = locals.username;
        if (quiz_id && round_id && round_number && username) {
            const rounds = getRounds(quiz_id);
            if (round_type === 'artist-track') {
                for (const answer of answers) {
                    const index = answers.indexOf(answer);
                    const answer_id = createAnswer(parseInt(round_id), username);
                    let artist = 'artist-' + index.toString();
                    let track = 'track-' + index.toString();
                    const artistField = data.get(artist)?.toString();
                    const trackField = data.get(track)?.toString();
                    if (artistField && trackField) {
                        await createAnswerField(await answer_id, artistField);
                        await createAnswerField(await answer_id, trackField);
                    }
                }
                if (parseInt(round_number) < rounds.length) {
                    throw redirect(303, `/play/quiz/${quiz_id}/round/${parseInt(round_number) + 1}/questions`);
                } else {
                    throw redirect(303, `/`);
                }
            }
            else if (round_type === 'artist'){
                for (const answer of answers) {
                    const index = answers.indexOf(answer);
                    const answer_id = createAnswer(parseInt(round_id), username);
                    let artist = 'artist-' + index.toString();
                    const artistField = data.get(artist)?.toString();
                    if (artistField) {
                        await createAnswerField(await answer_id, artistField);
                    }
                }
                if (parseInt(round_number) < rounds.length) {
                    throw redirect(303, `/play/quiz/${quiz_id}/round/${parseInt(round_number) + 1}/questions`);
                } else {
                    throw redirect(303, `/`);
                }
            }
        }
    }
}

export const load = (({params}) => {
    const round = getRound(params.quiz_id, parseInt(params.round_id));
    const questions = getQuestions(round.round_id);
    const slug = params.quiz_id;
    return {
        round,
        questions,
        slug,
    };
}) satisfies PageServerLoad;