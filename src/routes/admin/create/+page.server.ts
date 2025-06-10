import {type Actions, redirect} from "@sveltejs/kit";
import {createQuiz, createRound, getRoundTemplates} from "$lib/server/db";
import {createRequire} from 'module';
import type {PageServerLoad} from "../../../../.svelte-kit/types/src/routes/admin/$types";

const require = createRequire(import.meta.url);

export const load = (() => {
    const templates = getRoundTemplates();

    console.log(templates);
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
            await createQuiz(title, slug, rounds_parsed.length);
            for (const round of rounds_parsed) {
                const index = rounds_parsed.indexOf(round);

                if (round != 'null') {
                    await createRound(index + 1, slug, round);
                }
            }
            if (rounds_parsed[0] != 'null') {
                throw redirect(303, `/admin/edit/${slug}/round/1/questions`);
            }
            else {
                throw redirect(303, `/admin/edit/${slug}/round/1/new`);
            }
        }
    }
};