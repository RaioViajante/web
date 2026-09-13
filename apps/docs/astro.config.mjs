// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://docs.raioviajante.com',
	integrations: [
		starlight({
			title: 'RaioViajante Docs',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/RaioViajante/docs' },
			],
		}),
	],
});
