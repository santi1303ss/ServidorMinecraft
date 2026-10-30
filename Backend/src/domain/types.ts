export interface ServerData {
  name: string;
  engine: string;
  version: string;
  gameDir: string;
  maxRam: string;
  javaExec: string;
  jvmArgs: string;
  status: "running" | "stopped" | "starting";
  activeWorld: string | null;
}

export interface WorldData {
  name: string;
  port: number;
  serverIp: string;
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
  simulationDistance: number;
  spawnProtection: number;
  onlineMode: boolean;
  motd: string;
  whiteList: boolean;
  setupStatus: string;
  setupProgress: number;
  setupError: string;
  mods: ModData[];
}

export interface ModData {
  name: string;
  modId: string;
  fileName: string;
  enabled: boolean;
  source: string;
}
