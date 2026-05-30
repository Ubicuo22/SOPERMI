import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'SOPERMI',
				short_name: 'SOPERMI',
				description: 'Personal life OS — by Ubicuo Studio',
				theme_color: '#0a0a0a',
				background_color: '#0a0a0a',
				display: 'standalone',
				display_override: ['standalone', 'fullscreen'],
				orientation: 'portrait',
				start_url: '/yo',
				scope: '/',
				categories: ['productivity', 'health', 'fitness'],
				icons: [
					{
						src: '/icons/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			devOptions: {
				enabled: true
			}
		})
	]
});
