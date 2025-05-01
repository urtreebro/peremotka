import { checkUserCredentials, createAdminUser } from '$lib/server/db';
import { createSession } from '$lib/server/sessionStore';
import { fail, redirect, type Actions, type Cookies } from '@sveltejs/kit';

function performLogin(cookies: Cookies, username: string) {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const sessionId = createSession(username, maxAge);
    cookies.set('sessionId', sessionId, {path:'/', maxAge: maxAge});
}

export const actions: Actions = {
    register: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (username && password) {
            await createAdminUser(username, password, 'admin');
            performLogin(cookies, username);
            throw redirect(303, '/admin');
        } else {
            console.log('Missing username or password', data);
            return fail(400, { errorMessage: 'Не введено имя пользователя или пароль' });
        }
    },

    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (username && password) {
            const res = await checkUserCredentials(username, password);

            if (!res) {
                return fail(401, { errorMessage: 'Неверное имя пользователя или пароль' });
            }

            performLogin(cookies, username);
            throw redirect(303, '/admin');
        } else {
            return fail(400, { errorMessage: 'Не введено имя пользователя или пароль' });
        }
    }
};