import {type Actions, redirect} from "@sveltejs/kit";
import {createMapImage, createMapTemplate, createRound, createRoundTemplate} from "$lib/server/db";
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
        const special = data.getAll('selected')?.toString();

        const placeholders: string[] = JSON.parse(placeholders_str);
        const placeholders_string = placeholders.join(';');
        const slugify = require('slugify');
        const slug = slugify(title);
        let map_id = '';
        if (special == 'geography'){
            const points = data.getAll('points').toString();
            const image = data.get('mapImage')?.valueOf() as File;
            const map_title = data.get('mapTitle')?.toString();
            map_id = slugify(map_title);

            if (image) {
                await createMapTemplate(map_id, map_title!, points);
                await createMapImage(map_id, image);
            }
        }
        if (title) {
            if (special === 'geography') {
                await createRoundTemplate(slug, title, number_of_questions, number_of_fields, placeholders_string, 'geography', map_id);
            }
            else {
                await createRoundTemplate(slug, title, number_of_questions, number_of_fields, placeholders_string, null, null);
            }
            await createRound(round_number, quiz_id, slug);
            redirect(303, `/admin/edit/${quiz_id}/round/${round_number}/questions`)
        }
    }

}