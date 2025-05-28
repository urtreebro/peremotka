import {_rounds} from '../../../../../create/+page.server'
import {type Actions, redirect} from "@sveltejs/kit";
import {createRound} from "$lib/server/db";
import type {PageServerLoad} from "./$types";

let round_number: number;
let quiz_id: string;

export const load = (({params}) => {
    round_number = parseInt(params.round_id);
    quiz_id = params.slug;
}) satisfies PageServerLoad


export const actions: Actions = {
    save: async () => {
        await createRound(round_number, quiz_id, _rounds[round_number - 1].round_template_id);
        redirect(303, `/admin/edit/${quiz_id}/round/${round_number}/questions`);
    }
}