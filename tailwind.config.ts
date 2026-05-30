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
			},
			// Escala tipográfica del DESIGN_SYSTEM — usar SIEMPRE estos, nunca [8px]/[9px]/etc
			fontSize: {
				micro: ['10px', { lineHeight: '14px' }],   // timestamps, micro labels
				label: ['11px', { lineHeight: '15px' }],    // section labels (uppercase)
				meta: ['12px', { lineHeight: '16px' }],     // metadata secundaria
				body: ['13px', { lineHeight: '18px' }],     // contenido de listas/cards
				sub: ['14px', { lineHeight: '20px' }],      // subtítulos
				base: ['16px', { lineHeight: '22px' }],     // body base
				metric: ['22px', { lineHeight: '26px' }],   // métricas medianas (mono)
				hero: ['36px', { lineHeight: '40px' }]       // balance/timer/score héroe (mono)
			},
			// Escala de radio semántica — 4 niveles, nada de valores ad hoc
			borderRadius: {
				chip: '6px',      // badges, tags
				control: '10px',  // botones, inputs, tab pills
				card: '14px',     // cards, metric cards
				sheet: '20px'     // bottom sheets
			},
			// Safe-area para PWA con notch
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)'
			}
		}
	},
	plugins: []
} satisfies Config;
