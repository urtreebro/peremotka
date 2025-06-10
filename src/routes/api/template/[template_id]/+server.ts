import {error, type RequestHandler} from "@sveltejs/kit";
import {getMapImage} from "$lib/server/db";

export const GET = (async ({ params, setHeaders }) => {
    if (!params.template_id) {
        throw error(404, {
            message: 'Album not found',
        });
    }

    const img = getMapImage(params.template_id);

    if (!img || !img.data) {
        throw error(404, 'Image not found');
    }

    setHeaders({
        'Content-Type': img.mimeType,
        'Content-Length': img.size.toString(),
        'Cache-Control': 'public, max-age=600',
    });

    return new Response(img.data);
}) satisfies RequestHandler;
