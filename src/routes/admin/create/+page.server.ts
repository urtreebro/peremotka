import {type Actions, redirect} from "@sveltejs/kit";
import {createQuiz, createRound, getRoundTemplates} from "$lib/server/db";
import {createRequire} from 'module';
import type {Round} from "$lib/server/db/types";
import type {PageServerLoad} from "../../../../.svelte-kit/types/src/routes/admin/$types";

const require = createRequire(import.meta.url);
export let _rounds: Round[] = [];

export const load = (() => {
    const templates = getRoundTemplates();

    console.log(templates);
    return {
        templates,
        _rounds,
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    create: async ({request}) => {
        const data = await request.formData();
        const title = data.get('title')?.toString();
        const slugify = require('slugify');
        const slug = slugify(title);
        const selectedRounds = data.getAll('rounds').toString();


        console.log(selectedRounds)
        const rounds_parsed: string[] = JSON.parse(selectedRounds);

        console.log(rounds_parsed);
        _rounds.length = rounds_parsed.length;
        console.log(_rounds);
        _rounds.length = 0;
        if (title) {
            await createQuiz(title, slug);
            for (const round of rounds_parsed) {
                const index = rounds_parsed.indexOf(round);
                _rounds.push({
                    round_type: round,
                    round_number: index + 1,
                    round_template_id: round,
                    quiz_id: slug,
                    round_id: -1
                })
                if (round != 'null') {
                    _rounds[index].round_id = <number>await createRound(index + 1, slug, round);
                }
            }
            console.log(_rounds);
            if (_rounds[0].round_template_id != 'null') {
                throw redirect(303, `/admin/edit/${slug}/round/1/questions`);
            }
            else {
                throw redirect(303, `/admin/edit/${slug}/round/1/new`);
            }
        }
    }
};