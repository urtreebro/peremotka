import {getSession} from '$lib/server/sessionStore';
import {type Handle, redirect} from '@sveltejs/kit';

export const handle = (async ({event, resolve}) => {
    const {cookies} = event;
    const sessionId = cookies.get('sessionId');
    if (sessionId) {
        const session = getSession(sessionId);
        if (session) {
            event.locals.username = session.username;
            event.locals.roles = session.roles;

            if (!event.locals.roles && event.route.id !== null && (event.route.id.startsWith('/admin') || event.route.id.startsWith('play'))) {
                redirect(302, '/')
            }
            if (!event.locals.roles.includes('admin') && event.locals.roles.includes('player') && event.route.id !== null && event.route.id.startsWith('/admin')) {
                redirect(302, '/login');
            }
        } else {
            cookies.delete('sessionId', {path: '/'});
            event.locals.username = undefined;
            event.locals.roles = undefined;

        }
    } else {
        if (event.route.id !== null && event.route.id.startsWith('/play')) {
            redirect(302, '/')
        }
        else if (event.route.id !== null && event.route.id.startsWith('/admin')){
            redirect(302, '/login')
        }
    }
    return resolve(event);
}) satisfies Handle;