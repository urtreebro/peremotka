import {type Actions, redirect} from "@sveltejs/kit";
import {createRound, createRoundTemplate} from "$lib/server/db";
import {_rounds} from '../../../../../create/+page.server'
import {createRequire} from "module";
import type {PageServerLoad} from "./$types";

const require = createRequire(import.meta.url);
let round_number: number;
let quiz_id: string;

export const load = (({params}) => {
    round_number = parseInt(params.round_id);
    quiz_id = params.slug;
}) satisfies PageServerLoad

export const actions: Actions = {
    save: async ({request}) => {
        const data = await request.formData();
        const title = data.get('title')?.toString();
        const number_of_questions = parseInt(<string>data.get('number_of_questions')?.toString());
        const number_of_fields = parseInt(<string>data.get('number_of_fields')?.toString());
        const placeholders_str = data.getAll('placeholders').toString();
        console.log(placeholders_str);
        const placeholders: string[] = JSON.parse(placeholders_str);
        const placeholders_string = placeholders.join(';');
        const slugify = require('slugify');
        const slug = slugify(title);
        if (title) {
            await createRoundTemplate(slug, title, number_of_questions, number_of_fields, placeholders_string, null);
            console.log(_rounds);
            _rounds[round_number - 1].round_template_id = slug;
            _rounds[round_number - 1].round_id = <number>await createRound(round_number, quiz_id, slug);
            console.log(_rounds);
            redirect(303, `/admin/edit/${quiz_id}/round/${round_number}/questions`)
        }
    }

}