# MineServer

Panel para administrar servidores de Minecraft: crear servidores y mundos, instalar mods, ver la consola en vivo, configurar `server.properties` y exponer el server por túneles ngrok. Sin base de datos — todo vive en el filesystem.

## Estructura

```
MineServer/
├── Backend/    NestJS API (puerto 3060)
├── Frontend/   Angular SPA (puerto 4200)
└── README.md
```

## Requisitos

- Node.js 20+
- Java 17–21 instalado (Forge 1.20.1; el panel también detecta los JDKs del sistema)
- Windows (el picker de carpetas y el arranque del server usan PowerShell)

## Cómo levantar

```bash
# Terminal 1 — API
cd Backend
npm install
npm run start:dev

# Terminal 2 — UI
cd Frontend
npm install
ng serve
```

Abrir `http://localhost:4200`. El frontend hace proxy a la API en 3060 (`/api` y `/socket.io`).

## Dónde vive los datos

`~/Documents/Minecraft/` — por servidor una carpeta con `server.json` y sus mundos (`world.json`, `server.properties`, `logs/latest.log`). El picker de carpetas por defecto sugiere `~/Documents/mc-servers/`.

## Docs

- [Frontend](Frontend/README.md)
- [Backend](Backend/README.md)
