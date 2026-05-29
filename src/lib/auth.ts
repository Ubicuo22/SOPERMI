import { SignJWT, jwtVerify } from 'jose';
import pkg from 'bcryptjs';
const { compareSync } = pkg;

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
const MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '604800');

export function verifyPin(pin: string): boolean {
	const hash = process.env.AUTH_PIN_HASH;
	if (!hash) return pin === '123456';
	return compareSync(pin, hash);
}

export async function createSession(): Promise<string> {
	return new SignJWT({ sub: 'owner' })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(`${MAX_AGE}s`)
		.sign(SECRET);
}

export async function verifySession(token: string): Promise<boolean> {
	try {
		await jwtVerify(token, SECRET);
		return true;
	} catch {
		return false;
	}
}

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = MAX_AGE;
