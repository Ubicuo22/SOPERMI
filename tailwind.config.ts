import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				bg: '#0a0a0a',
				surface: '#141414',
				elevated: '#1e1e1e',
				border: '#222222',
				'border-soft': '#1a1a1a',
				accent: '#b8f240',
				'accent-dim': '#7aab1a',
				'accent-bg': 'rgba(184, 242, 64, 0.08)',
				t1: '#f0f0f0',
				t2: '#888888',
				t3: '#444444',
				danger: '#ff4545',
				'danger-bg': 'rgba(255, 69, 69, 0.08)',
				warn: '#f0a500',
				'warn-bg': 'rgba(240, 165, 0, 0.08)'
			},
			fontFamily: {
				mono: ['JetBrains Mono', 'monospace'],
				sans: ['DM Sans', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
} satisfies Config;
