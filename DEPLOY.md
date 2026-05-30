# Deploy en la Mac Mini M4

Guía paso a paso para dejar SOPERMI corriendo 24/7, accesible desde cualquier
lado por HTTPS, con backups automáticos. Sigue los pasos en orden.

> Objetivo: que la app esté **siempre encendida y alcanzable desde el iPhone
> fuera de casa** (sin esto, el tracker no sirve — comes/entrenas/gastas fuera).

---

## 0. Requisitos en la Mac Mini

```bash
# Node 20+ (si no lo tienes, instala con Homebrew)
node -v        # debe ser >= 20

# PM2 (process manager — mantiene la app viva y la reinicia si crashea)
npm install -g pm2

# dotenv (para que el build de producción lea el .env)
npm install dotenv
```

---

## 1. Traer el código y construir

```bash
cd ~/Documents/SOPERMI      # o donde clones el repo
git pull                    # última versión
npm install
npm run build               # genera ./build con adapter-node
```

---

## 2. Configurar el .env de producción

Genera los secretos **en la Mac Mini** (no reutilices los de desarrollo):

```bash
# Hash del PIN — cambia 123456 por TU PIN de 6 dígitos
node -e "const b=require('bcryptjs'); console.log(b.hashSync('TU_PIN', 10))"

# JWT secret aleatorio
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edita `.env`:

```
DB_PATH=/Users/<tu-usuario>/sopermi-data/dashboard.db
AUTH_PIN_HASH=<el hash bcrypt de arriba>
JWT_SECRET=<el hex aleatorio de arriba>
SESSION_MAX_AGE=604800
NODE_ENV=production
PORT=3000
ORIGIN=https://dash.ubicuo.icu
```

> **Importante:** `DB_PATH` apunta a una carpeta **fuera del repo** (ej.
> `~/sopermi-data/`) para que un `git pull` o rebuild nunca toque tus datos.
> Crea la carpeta: `mkdir -p ~/sopermi-data`

---

## 3. Arrancar con PM2

```bash
# Arranca leyendo el .env (gracias a dotenv)
pm2 start build/index.js --name sopermi --node-args="-r dotenv/config"

pm2 save           # guarda el proceso para que reviva tras reiniciar
pm2 startup        # imprime un comando — córrelo para auto-arranque al bootear la Mac
```

Verifica local:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login   # debe dar 200
pm2 logs sopermi   # ver logs en vivo
```

---

## 4. HTTPS público con Cloudflare Tunnel

Esto da HTTPS automático (necesario para que iOS instale la PWA y permita
**notificaciones push**), sin abrir puertos en tu router.

```bash
# Si no está instalado
brew install cloudflared

# Login (abre el navegador, elige el dominio ubicuo.icu)
cloudflared tunnel login

# Crear el túnel (una vez)
cloudflared tunnel create sopermi

# Rutear el subdominio al túnel
cloudflared tunnel route dns sopermi dash.ubicuo.icu
```

Crea `~/.cloudflared/config.yml`:

```yaml
tunnel: sopermi
credentials-file: /Users/<tu-usuario>/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: dash.ubicuo.icu
    service: http://localhost:3000
  - service: http_status:404
```

Corre el túnel como servicio (sobrevive reinicios):

```bash
sudo cloudflared service install
sudo launchctl start com.cloudflare.cloudflared   # o reinicia la Mac
```

Prueba desde el iPhone (con datos móviles, no WiFi): abre
`https://dash.ubicuo.icu` → login con tu PIN → "Compartir → Agregar a inicio".

---

## 5. Backups automáticos (cron diario)

El script `scripts/backup.sh` hace backup en caliente y conserva los últimos 14.

```bash
chmod +x scripts/backup.sh

# Probar a mano
DB_PATH=~/sopermi-data/dashboard.db BACKUP_DIR=~/sopermi-data/backups bash scripts/backup.sh

# Programar diario a las 4am con crontab
crontab -e
```

Agrega esta línea (ajusta la ruta del repo):

```
0 4 * * * cd ~/Documents/SOPERMI && DB_PATH=~/sopermi-data/dashboard.db BACKUP_DIR=~/sopermi-data/backups /bin/bash scripts/backup.sh >> ~/sopermi-data/backup.log 2>&1
```

> Extra recomendado: que `~/sopermi-data/` esté dentro de iCloud Drive o un
> disco con Time Machine, para tener una copia fuera de la Mac.

---

## 6. Actualizar la app (cada vez que haya cambios)

```bash
cd ~/Documents/SOPERMI
git pull
npm install
npm run build
pm2 restart sopermi
```

Los datos viven en `~/sopermi-data/`, así que actualizar nunca los borra.

---

## Checklist de verificación final

- [ ] `pm2 status` muestra `sopermi` en `online`
- [ ] `curl https://dash.ubicuo.icu/login` da 200 desde fuera de la red
- [ ] El iPhone abre la app con datos móviles (no solo WiFi)
- [ ] Instalada como PWA en la pantalla de inicio
- [ ] `crontab -l` muestra el job de backup
- [ ] Existe al menos un archivo en `~/sopermi-data/backups/`
- [ ] El PIN ya NO es 123456 y el JWT_SECRET es aleatorio
