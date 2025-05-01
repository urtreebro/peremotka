import {type Actions, type Cookies, fail, redirect} from "@sveltejs/kit";
import {createPlayerUser, getQuizzes} from "$lib/server/db";
import {createSession} from "$lib/server/sessionStore";
import type { PageServerLoad } from './$types';

function performLogin(cookies: Cookies, username: string) {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const sessionId = createSession(username, maxAge);
    cookies.set('sessionId', sessionId, {path:'/', maxAge: maxAge});
}

export const load = (({ locals }) => {
    const quizzes = getQuizzes();
    const { username } = locals;

    return {
        quizzes,
        loggedIn: !!username
    };
}) satisfies PageServerLoad

export const actions: Actions = {
    register: async ({request, cookies}) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();

        if (username) {
            await createPlayerUser(username, 'player');
            performLogin(cookies, username);
            throw redirect(303, '/play');
        } else {
            return fail(400, {errorMessage: 'Введите название команды'})
        }
    }
};