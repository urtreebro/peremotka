import {type Actions, redirect} from "@sveltejs/kit";
import {createQuiz, createRound} from "$lib/server/db";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export const actions: Actions = {
    create: async ({request}) => {
        const data = await request.formData();
        const title = data.get('title')?.toString();
        const slugify = require('slugify');
        const slug = slugify(title);
        const selectedRounds = data.getAll('rounds').toString();


        console.log(selectedRounds)
        const rounds = JSON.parse(selectedRounds);

        console.log(rounds);
        if (title && slug) {
            await createQuiz(title, slug);
            for (const round of rounds){
                const index = rounds.indexOf(round);
                await createRound(round.type, index + 1, slug);
            }
            throw redirect(303, `/admin/edit/${slug}/round/1/questions`);
        }
    }
};