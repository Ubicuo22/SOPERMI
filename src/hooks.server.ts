import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { verifySession, SESSION_COOKIE } from '$lib/auth';
import { db } from '$lib/db';
import { seed } from '$lib/db/seed';

seed();

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);

	if (token) {
		event.locals.authenticated = await verifySession(token);
	} else {
		event.locals.authenticated = false;
	}

	if (!event.locals.authenticated && !event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/api/auth')) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
