# MineServer — Frontend

SPA en Angular 22 (standalone components + signals) con estética de launcher de Minecraft: Pixelify Sans + VT323, fondo `#140601`, navbar/sidebar `rgb(37,22,22)`.

## Dev

```bash
ng serve
```

`http://localhost:4200` con hot reload. El proxy (`proxy.conf.json`) mapea `/api` y `/socket.io` → `http://localhost:3060`, así que el backend debe estar corriendo.

## Build

```bash
ng build
```

Artefactos en `dist/`. Assets (íconos, carrusel) viven en `public/`.

## Estructura

```
src/app/
├── app.{html,ts,scss}        Shell: navbar, sidebar, vistas (servers/worlds/detail)
├── components/               Header, cards, formularios, consola (xterm), modales
├── services/api.service.ts   REST + browser de carpetas
└── models/api.models.ts      Tipos Server/World/Mod
src/styles/                   Variables (tokens), componentes compartidos (mc-*)
```

## Detalle de mundo

Vista con tabs: **Console** (terminal vía socket.io, se autoconecta con polling de logs) y **Config** (info items: booleanos con checkbox estilo MC de un lado, valores del otro — seed, distancias, MOTD, etc.).

## Tests

```bash
ng test      # unit (Vitest)
ng e2e       # e2e
```
