// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://docs.raioviajante.com',
	integrations: [
		starlight({
			title: 'RaioViajante Docs',
			favicon: '/icon.png',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/RaioViajante/docs' },
			],
			customCss: ['./src/styles/theme.css'],
			components: {
				Sidebar: './src/components/overrides/Sidebar.astro',
				Footer: './src/components/overrides/Footer.astro',
				Hero: './src/components/overrides/Hero.astro',
				SiteTitle: './src/components/overrides/SiteTitle.astro',
				PageFrame: './src/components/overrides/PageFrame.astro',
				ThemeSelect: './src/components/overrides/ThemeSelect.astro',
				MobileMenuFooter: './src/components/overrides/MobileMenuFooter.astro',
			},
			sidebar: [
				{
					label: 'raioviajante',
					items: [
						{ label: 'design language', link: '/raioviajante/design-language/' },
						{ label: 'repository conventions', link: '/raioviajante/repository-conventions/' },
					],
				},
			],
			head: [
				{
					tag: 'link',
					attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				},
				{
					tag: 'link',
					attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
				},
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap',
					},
				},
			],
		}),
	],
});
