# MineServer — Backend

API en NestJS (puerto **3060**) que administra servidores de Minecraft puramente por filesystem — sin base de datos.

## Levantar

```bash
npm install
npm run start:dev   # watch (nest start --watch)
```

## Módulos

| Módulo | Qué hace |
|--------|----------|
| `servers` | CRUD de servidores, detecta Java instalado, browse de carpetas (FolderBrowserDialog nativo), arranque del JVM con `@argfile` |
| `worlds` | CRUD de mundos, lee/escribe `server.properties` (seed, distancias, MOTD, booleans…) |
| `setup` | Instalación del engine (Vanilla/Paper/Forge/NeoForge) con progreso en memoria |
| `terminal` | WebSocket + node-pty: consola real (PowerShell) por `socket.io` (`terminal:open/input/resize/close`) |
| `domain` | Paths, repos de `server.json`/`world.json`, parser de properties, utilidades fs |
| `tunnels` | Túneles ngrok |

## Datos

`~/Documents/Minecraft/<servidor>/<mundo>/`:

- `server.json` — metadata del servidor (engine, versión, RAM, java, mundo activo)
- `world.json` + `server.properties` — metadata y config del mundo
- `logs/latest.log` — log para el streaming de consola

## API

Prefijo `/api`. Rutas principales: `GET/POST /servers`, `GET /servers/browse`, `GET/POST /servers/:name/worlds`, `PUT /servers/:name/worlds/:world`, `GET /servers/:name/java`, `GET /api/tunnels`.

## Notas

- Forge 1.20.1 necesita Java 17–21 (Java 25 crashea con `Unsupported class file major version 69`).
- El arranque usa `spawn` sin shell + argfile (`win_args.txt`), nunca `.bat`.
- Tests: `npm run test` (unit), `npm run test:e2e` (e2e).
