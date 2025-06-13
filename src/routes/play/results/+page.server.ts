import type {PageServerLoad} from "./$types";
import {getBlanksScores, getCurrentQuiz, getRounds} from "$lib/server/db";
import type {Blank, Result} from "$lib/server/db/types";

export const load = (async () => {
    const current_quiz = getCurrentQuiz();
    current_quiz.rounds = getRounds(current_quiz.id);

    let results: Map<string, Result> = new Map();

    for (let i = 0; i < current_quiz.length; i++) {
        const blanks: Blank[] = getBlanksScores(current_quiz.rounds[i].round_id);
        for (const blank of blanks) {
            if (results.has(blank.player_name)) {
                results.set(blank.player_name, {
                    scores: [...results.get(blank.player_name)!.scores],
                    final_score: results.get(blank.player_name)!.final_score + blank.score
                });
            }
            else {
                results.set(blank.player_name, {
                    scores: [blank.score],
                    final_score: blank.score
                })
            }
        }
    }
    const results1 = Array.from(results, ([name, result]) => ({ name, result }));
    return {
        current_quiz,
        results1,
    };
}) satisfies PageServerLoad;