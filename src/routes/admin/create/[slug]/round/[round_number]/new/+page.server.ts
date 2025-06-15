import {type Actions, fail, redirect} from "@sveltejs/kit";
import {
    checkTemplateTitleExistence,
    createMapImage,
    createMapTemplate,
    createRound,
    createRoundTemplate
} from "$lib/server/db";
import {createRequire} from "module";
import type {PageServerLoad} from "./$types";

const require = createRequire(import.meta.url);
let round_number: number;
let quiz_id: string;

export const load = (({params}) => {
    round_number = parseInt(params.round_number);
    quiz_id = params.slug;
    return {
        quiz_id,
    }
}) satisfies PageServerLoad

export const actions: Actions = {
    save: async ({request}) => {
        const data = await request.formData();
        const title = data.get('title')?.toString();

        if (!title) {
            return fail(400, {errorNoTemplate: 'Введите название шаблона'});
        }
        const number_of_questions = parseInt(<string>data.get('number_of_questions')?.toString());
        const number_of_fields = parseInt(<string>data.get('number_of_fields')?.toString());
        const placeholders_str = data.getAll('placeholders').toString();
        const isSpecialsChecked = data.get('isSpecialsChecked')?.toString();
        const special = data.getAll('selected')?.toString();
        const placeholders: string[] = JSON.parse(placeholders_str);
        for (const placeholder of placeholders) {
            if (!placeholder) {
                return fail(400, {errorNoPlaceholder: 'Введите заполнители полей'})
            }
        }
        const placeholders_string = placeholders.join(';');

        const slugify = require('slugify');
        const slug = slugify(title);
        let map_id = '';
        if (isSpecialsChecked === 'true') {
            if (special == 'geography') {
                const points = data.getAll('points').toString();
                const image = data.get('mapImage')?.valueOf() as File;
                if (!image || image.size == 0) {
                    return fail(400, {errorMapImage: 'Выберите изображение'})
                }
                const map_title = data.get('mapTitle')?.toString();
                if (!map_title) {
                    return fail(400, {errorMapImage: 'Введите название карты'})
                }
                map_id = slugify(map_title);

                await createMapTemplate(map_id, map_title, points);
                await createMapImage(map_id, image);
            }
        }
        if (title) {
            if (checkTemplateTitleExistence(title)) {
                return fail(400, {errorNoTemplate: 'Шаблон с таким названием уже существует'});
            }
            if (special === 'geography') {
                await createRoundTemplate(slug, title, number_of_questions, number_of_fields, placeholders_string, 'geography', map_id);
            }
            else {
                await createRoundTemplate(slug, title, number_of_questions, number_of_fields, placeholders_string, null, null);
            }
            await createRound(round_number, quiz_id, slug);
            redirect(303, `/admin/create/${quiz_id}/round/${round_number}/questions`)
        }
    }
}