import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ["peremotka-u9yig.ondigitalocean.app", "peremotka.games",
			"peremotka-u9yig.ondigitalocean.app/", "peremotka.games/"],
	}
});
