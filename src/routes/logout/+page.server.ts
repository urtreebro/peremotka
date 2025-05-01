import { deleteSession } from '$lib/server/sessionStore';
import { redirect } from '@sveltejs/kit';
import type {PageServerLoad} from "../../../.svelte-kit/types/src/routes/$types";


export const load: PageServerLoad = (({ cookies }) => {
    const sessionId = cookies.get('sessionId');
    if (sessionId) {
        cookies.delete('sessionId', {path:'/'});
        deleteSession(sessionId);
    }

    throw redirect(303, '/');
}) satisfies PageServerLoad;