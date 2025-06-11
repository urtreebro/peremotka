import {getSession} from '$lib/server/sessionStore';
import {error, type Handle, redirect, type RequestEvent} from '@sveltejs/kit';
import { allowedOrigins } from "$lib/config";

const csrf = (
    event: RequestEvent,
    allowedOrigins: string[],
) => {
    const {request} = event;

    let forbidden =
        isFormContentType(request) &&
        (request.method === "POST" ||
            request.method === "PUT" ||
            request.method === "PATCH" ||
            request.method === "DELETE") &&
        !allowedOrigins.includes(request.headers.get("origin") || "");
    console.log(request.headers.get("origin"), 888, forbidden);

    if (forbidden) {
        error(403, `Cross-site ${request.method} form submissions are forbidden`);
    }
};
function isContentType(request: Request, ...types: string[]) {
    const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
    return types.includes(type.toLowerCase());
}
function isFormContentType(request: Request) {
    // These content types must be protected against CSRF
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/enctype
    return isContentType(
        request,
        "application/x-www-form-urlencoded",
        "multipart/form-data",
        "text/plain",
    );
}

export const handle = (async ({event, resolve}) => {
    const {cookies} = event;
    csrf(event, allowedOrigins);
    const sessionId = cookies.get('sessionId');
    if (sessionId) {
        const session = getSession(sessionId);
        if (session) {
            event.locals.username = session.username;
            event.locals.role = session.role;

            if (!event.locals.role && event.route.id !== null && (event.route.id.startsWith('/admin') || event.route.id.startsWith('/play'))) {
                redirect(302, '/')
            }
            if (event.locals.role !== 'admin' && event.locals.role === 'player' && event.route.id !== null && event.route.id.startsWith('/admin')) {
                redirect(302, '/login');
            }
            if (event.locals.role === 'admin' && event.route.id !== null && event.route.id === '/') {
                redirect(302, '/admin');
            }
            if (event.locals.role === 'player' && event.route.id !== null && event.route.id === '/') {
                redirect(302, '/play');
            }
            if (event.locals.completed && event.route.id !== null && event.route.id.startsWith('/play/quiz')) {
                redirect(302, '/play/results');
            }
        }
        else {
            cookies.delete('sessionId', {path: '/'});
            event.locals.username = undefined;
            event.locals.role = undefined;

        }
    }
    else {
        if (event.route.id !== null && event.route.id.startsWith('/play')) {
            redirect(302, '/')
        }
        else if (event.route.id !== null && event.route.id.startsWith('/admin')) {
            redirect(302, '/login')
        }
    }
    return resolve(event);
}) satisfies Handle;