import {type Actions, type Cookies, fail, redirect} from "@sveltejs/kit";
import {createPlayerUser, getCurrentQuiz} from "$lib/server/db";
import {createSession} from "$lib/server/sessionStore";
import type {PageServerLoad} from './$types';
import type {Quiz} from "$lib/server/db/types";

function performLogin(cookies: Cookies, username: string) {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const sessionId = createSession(username, 'player', maxAge);
    cookies.set('sessionId', sessionId, {path: '/', maxAge: maxAge});
}
let current_quiz: Quiz;
export const load = (({locals}) => {
    const {username} = locals;
     current_quiz = getCurrentQuiz();

    return {
        loggedIn: !!username,
        current_quiz
    };
}) satisfies PageServerLoad

export const actions: Actions = {
    register: async ({request, cookies}) => {
        const data = await request.formData();
        const current_quiz_1 = data.get('current_quiz')?.toString();
        const username = data.get('username')?.toString();

        if (username && current_quiz_1) {
            await createPlayerUser(username, current_quiz_1);
            performLogin(cookies, username);
            throw redirect(303, `/play/quiz/${current_quiz.id}/round/1/questions`);
        } else {
            return fail(400, {errorMessage: 'Введите название команды'})
        }
    }
};