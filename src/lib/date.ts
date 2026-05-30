// Fechas en hora LOCAL, no UTC.
// La app es de un solo usuario en una sola zona horaria (México), así que
// el "día" debe anclarse a la hora local. Usar new Date().toISOString()
// causaba que todo lo registrado después de las ~18:00 cayera en el día siguiente.

function pad(n: number): string {
	return String(n).padStart(2, '0');
}

/** Fecha local de hoy en formato YYYY-MM-DD */
export function todayLocal(): string {
	const d = new Date();
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Mes local actual en formato YYYY-MM */
export function monthLocal(): string {
	const d = new Date();
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Timestamp local en formato YYYY-MM-DDTHH:MM:SS (compatible con julianday de SQLite y con LIKE por prefijo de día) */
export function nowLocal(): string {
	const d = new Date();
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Suma (o resta) días a una fecha YYYY-MM-DD sin desfase de zona horaria */
export function addDaysLocal(dateStr: string, days: number): string {
	const [y, m, d] = dateStr.split('-').map(Number);
	const dt = new Date(y, m - 1, d + days);
	return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
