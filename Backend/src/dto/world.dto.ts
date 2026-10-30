export interface CreateWorldDto {
  name: string;
  seed?: string;
  gameMode?: string;
  difficulty?: string;
  seedType?: string;
  bonusChest?: boolean;
  enableCommands?: boolean;
  generateStructures?: boolean;
  pvp?: boolean;
  maxPlayers?: number;
  viewDistance?: number;
  simulationDistance?: number;
  spawnProtection?: number;
  onlineMode?: boolean;
  motd?: string;
}

export interface UpdateWorldDto {
  name?: string;
  seed?: string;
  gameMode?: string;
  difficulty?: string;
  seedType?: string;
  bonusChest?: boolean;
  enableCommands?: boolean;
  generateStructures?: boolean;
  pvp?: boolean;
  maxPlayers?: number;
  viewDistance?: number;
  simulationDistance?: number;
  spawnProtection?: number;
  onlineMode?: boolean;
  motd?: string;
  whiteList?: boolean;
}
