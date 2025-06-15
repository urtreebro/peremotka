import {type Actions, fail, redirect} from "@sveltejs/kit";
import {
    checkQuizIdExistence,
    checkQuizTitleExistence,
    createQuiz,
    createRound,
    getRoundTemplates
} from "$lib/server/db";
import {createRequire} from 'module';
import type {PageServerLoad} from "./$types";

const require = createRequire(import.meta.url);

export const load = (() => {
    const templates = getRoundTemplates();

    return {
        templates,
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    create: async ({request}) => {
        const data = await request.formData();
        const title = data.get('title')?.toString();
        const slugify = require('slugify');
        const slug = slugify(title);
        const selectedRounds = data.getAll('rounds').toString();

        const rounds_parsed: string[] = JSON.parse(selectedRounds);
        if (title) {
            if (checkQuizTitleExistence(title)) {
                return fail(400, {errorMessage: 'Квиз с таким названием уже существует'})
            }
            let quiz_id = slug;
            let idx = 1;
            while (checkQuizIdExistence(quiz_id)) {
                quiz_id = slug + idx.toString();
                idx++;
            }
            await createQuiz(title, quiz_id, rounds_parsed.length);
            for (let i = 0; i < rounds_parsed.length; ++i){
                if (rounds_parsed[i] != 'null'){
                    await createRound(i + 1, quiz_id, rounds_parsed[i]);
                }
            }

            if (rounds_parsed[0] != 'null') {
                throw redirect(303, `/admin/create/${quiz_id}/round/1/questions`);
            }
            else {
                throw redirect(303, `/admin/create/${quiz_id}/round/1/new`);
            }
        } else{
            return fail(400, {errorMessage: 'Введите название'})
        }
    }
};