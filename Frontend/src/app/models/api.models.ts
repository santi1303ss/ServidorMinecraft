export interface Server {
  name: string;
  engine: string;
  version: string;
  gameDir: string;
  maxRam: string;
  javaExec: string;
  jvmArgs: string;
  status: string;
  activeWorld: string | null;
}

export interface World {
  name: string;
  port: number;
  serverIp?: string;
  seed: string;
  gameMode: string;
  difficulty: string;
  seedType: string;
  bonusChest: boolean;
  enableCommands: boolean;
  generateStructures: boolean;
  pvp: boolean;
  maxPlayers: number;
  viewDistance: number;
  simulationDistance?: number;
  spawnProtection: number;
  onlineMode: boolean;
  motd: string;
  whiteList: boolean;
  setupStatus: string;
  setupProgress: number;
  setupError: string;
  mods: Mod[];
}

export interface Mod {
  name: string;
  modId: string;
  fileName: string;
  enabled: boolean;
  source: string;
}

export interface Version {
  version: string;
  type: string;
  stable: boolean;
}

export interface Tunnels {
  minecraft_tunnel: string;
  voice_chat_tunnel: string;
}

export interface PingResult {
  online: boolean;
  error?: string;
}

export type ViewType = "servers" | "worlds" | "detail";
