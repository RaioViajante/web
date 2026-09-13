/// <reference types="astro/client" />

// Starlight resolves its internal components through Vite virtual modules at build
// time; this ambient declaration only tells the type-checker the specifier exists.
declare module 'virtual:starlight/components/*' {
	import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
	const Component: AstroComponentFactory;
	export default Component;
}
