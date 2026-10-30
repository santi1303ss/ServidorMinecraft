import * as fs from "fs";
import type { WorldData } from "./types.js";

type ServerProperties = Omit<WorldData, "name" | "setupStatus" | "setupProgress" | "setupError" | "mods">;

const PROPERTIES_DEFAULTS: ServerProperties = {
  port: 25565,
  serverIp: "",
  seed: "",
  gameMode: "survival",
  difficulty: "normal",
  seedType: "default",
  bonusChest: false,
  enableCommands: false,
  generateStructures: true,
  pvp: true,
  maxPlayers: 20,
  viewDistance: 10,
  simulationDistance: 10,
  spawnProtection: 16,
  onlineMode: true,
  motd: "A Minecraft Server",
  whiteList: false,
};

export function parseServerProperties(filePath: string): ServerProperties {
  try {
    if (!fs.existsSync(filePath)) return { ...PROPERTIES_DEFAULTS };
    const content = fs.readFileSync(filePath, "utf-8");
    const props: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      props[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }

    return {
      port: parseInt(props["server-port"] || "25565", 10),
      serverIp: props["server-ip"] || "",
      seed: props["level-seed"] || "",
      gameMode: props["gamemode"] || "survival",
      difficulty: props["difficulty"] || "normal",
      seedType: PROPERTIES_DEFAULTS.seedType,
      bonusChest: props["spawn-bonus-chest"] === "true",
      enableCommands: props["enable-command-block"] === "true",
      generateStructures: props["generate-structures"] !== "false",
      pvp: props["pvp"] !== "false",
      maxPlayers: parseInt(props["max-players"] || "20", 10),
      viewDistance: parseInt(props["view-distance"] || "10", 10),
      simulationDistance: parseInt(props["simulation-distance"] || "10", 10),
      spawnProtection: parseInt(props["spawn-protection"] || "16", 10),
      onlineMode: props["online-mode"] !== "false",
      motd: props["motd"] || "A Minecraft Server",
      whiteList: props["white-list"] === "true",
    };
  } catch {
    return { ...PROPERTIES_DEFAULTS };
  }
}

export function writeServerProperties(filePath: string, data: ServerProperties): void {
  const props = [
    `server-port=${data.port || 25565}`,
    `server-ip=${data.serverIp || ""}`,
    "level-name=world",
    `level-seed=${data.seed}`,
    `gamemode=${data.gameMode}`,
    `difficulty=${data.difficulty}`,
    `pvp=${data.pvp}`,
    `generate-structures=${data.generateStructures ?? true}`,
    `max-players=${data.maxPlayers}`,
    `view-distance=${data.viewDistance}`,
    `simulation-distance=${data.simulationDistance ?? 10}`,
    `spawn-protection=${data.spawnProtection}`,
    `enable-command-block=${data.enableCommands}`,
    `spawn-bonus-chest=${data.bonusChest}`,
    `online-mode=${data.onlineMode ?? true}`,
    `white-list=${data.whiteList ?? false}`,
    `motd=${data.motd || "A Minecraft Server"}`,
    "max-tick-time=60000",
    "network-compression-threshold=256",
    "rate-limit=0",
    "prevent-proxy-connections=false",
    "use-native-transport=true",
    "entity-broadcast-range-percentage=100",
    "sync-chunk-writes=true",
    "text-filtering-config=",
    "log-ips=true",
  ].join("\n");

  fs.writeFileSync(filePath, props, "utf-8");
}
