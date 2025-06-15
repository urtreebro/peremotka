import {
    changeBlankState,
    getAnswers,
    getBlank,
    getQuestions,
    getRoundById,
    updateBlankScore,
} from "$lib/server/db";
import {type Actions, redirect} from "@sveltejs/kit";
import type {Blank} from "$lib/server/db/types";

let blank: Blank;
export const load = (async ({params}) => {
    blank = getBlank(parseInt(params.blank_id));
    const round = getRoundById(blank.round_id);
    const correct_answers = getQuestions(blank.round_id);
    const player_answers = getAnswers(blank.id);

    return {
        blank,
        round,
        correct_answers,
        player_answers,
    }
})

export const actions: Actions = {
    save: async ({request}) => {
        const data = await request.formData();
        const scores_unparsed = data.getAll("scores").toString();
        const scores = JSON.parse(scores_unparsed) as number[][];
        let final_score = 0;
        for (let i = 0; i < scores.length; ++i) {
            for (let j = 0; j < scores[i].length; ++j) {
                final_score += scores[i][j];
            }
        }
        await updateBlankScore(blank.player_name, blank.quiz_id, blank.round_id, final_score);
        await changeBlankState(blank.id, "Проверен");
        redirect(303, `/admin/reviewer`);
    }
}