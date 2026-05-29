import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPin, createSession, SESSION_COOKIE, SESSION_MAX_AGE } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { pin } = await request.json();

	if (!verifyPin(pin)) {
		return json({ error: 'PIN incorrecto' }, { status: 401 });
	}

	const token = await createSession();

	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: false,
		maxAge: SESSION_MAX_AGE
	});

	return json({ data: { ok: true } });
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE, { path: '/' });
	return json({ data: { ok: true } });
};
