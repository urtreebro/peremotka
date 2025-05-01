import {createQuestion, createQuestionField, getRound, getRounds} from '$lib/server/db'
import type {PageServerLoad} from './$types';
import {type Actions, redirect} from "@sveltejs/kit";

export const actions: Actions = {
    submit: async ({request}) => {
        const data = await request.formData();
        const questions1 = data.getAll('questions').toString();
        const questions = JSON.parse(questions1);
        const quiz_id = data.get('quiz_id')?.toString();
        const round_id = data.get('round_id')?.toString();
        const round_type = data.get('round_type')?.toString();
        const round_number = data.get('round_number')?.toString();
        console.log(questions);
        if (quiz_id && round_id && round_number) {
            const rounds = getRounds(quiz_id);
            if (round_type === 'artist-track') {
                for (const question of questions) {
                    console.log(question, "PALLSPDOCp");
                    const index = questions.indexOf(question);
                    const question_id = createQuestion(parseInt(round_id));
                    let artist = 'artist-' + index.toString();
                    let track = 'track-' + index.toString();
                    const artistField = data.get(artist)?.toString();
                    const trackField = data.get(track)?.toString();
                    if (artistField && trackField) {
                        createQuestionField(await question_id, 'Исполнитель', artistField);
                        createQuestionField(await question_id, 'Песня', trackField);
                    }
                }
                if (parseInt(round_number) < rounds.length) {
                    throw redirect(303, `/admin/edit/${quiz_id}/round/${parseInt(round_number) + 1}/questions`);
                } else {
                    throw redirect(303, `/admin`);
                }
            }
            else if (round_type === 'artist'){
                for (const question of questions) {
                    const index = questions.indexOf(question);
                    const question_id = createQuestion(parseInt(round_id));
                    let artist = 'artist-' + index.toString();
                    const artistField = data.get(artist)?.toString();
                    if (artistField) {
                        createQuestionField(await question_id, 'Исполнитель', artistField);
                    }
                }
                if (parseInt(round_number) < rounds.length) {
                    throw redirect(303, `/admin/edit/${quiz_id}/round/${parseInt(round_number) + 1}/questions`);
                } else {
                    throw redirect(303, `/admin`);
                }
            }
        }
    }
}

export const load = (({params}) => {
    const round = getRound(params.slug, parseInt(params.round_id));
    const slug = params.slug;
    return {
        round,
        slug,
    };
}) satisfies PageServerLoad;
