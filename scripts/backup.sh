#!/usr/bin/env bash
# Backup en caliente de la DB de SOPERMI (no requiere detener la app).
# Usa el comando .backup de SQLite, que consolida WAL + shm en un solo archivo.
# Mantiene los últimos N backups y borra los más viejos.

set -euo pipefail

# Ruta de la DB (ajustar en producción a la ruta absoluta de la Mac Mini)
DB_PATH="${DB_PATH:-./data/dashboard.db}"
BACKUP_DIR="${BACKUP_DIR:-./data/backups}"
KEEP="${KEEP:-14}"   # cuántos backups conservar

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
	echo "[backup] no existe la DB en $DB_PATH — nada que respaldar"
	exit 0
fi

STAMP=$(date +%Y%m%d-%H%M%S)
DEST="$BACKUP_DIR/sopermi-$STAMP.db"

sqlite3 "$DB_PATH" ".backup '$DEST'"
echo "[backup] creado $DEST"

# Rotación: conservar solo los últimos $KEEP
COUNT=$(ls -1 "$BACKUP_DIR"/sopermi-*.db 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -gt "$KEEP" ]; then
	ls -1t "$BACKUP_DIR"/sopermi-*.db | tail -n +$((KEEP + 1)) | while read -r old; do
		rm -f "$old"
		echo "[backup] rotado (borrado) $old"
	done
fi
