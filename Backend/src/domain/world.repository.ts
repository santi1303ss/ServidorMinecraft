import * as fs from "fs";
import * as path from "path";
import { getServerDir, getWorldDir } from "./paths.js";
import { readJson, writeJson } from "./json-io.js";
import { parseServerProperties } from "./properties.parser.js";
import { listMods } from "./mod.repository.js";
import type { WorldData } from "./types.js";

interface WorldMeta {
  setupStatus: string;
  setupProgress: number;
  setupError: string;
}

function readWorldMeta(serverName: string, worldName: string): WorldMeta {
  return readJson<WorldMeta>(path.join(getWorldDir(serverName, worldName), "world.json"), {
    setupStatus: "completed",
    setupProgress: 100,
    setupError: "",
  });
}

function writeWorldMeta(serverName: string, worldName: string, meta: WorldMeta): void {
  writeJson(path.join(getWorldDir(serverName, worldName), "world.json"), meta);
}

export function listWorlds(serverName: string): WorldData[] {
  const serverDir = getServerDir(serverName);
  if (!fs.existsSync(serverDir)) return [];
  return fs.readdirSync(serverDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "mods")
    .map((d) => {
      const props = parseServerProperties(path.join(serverDir, d.name, "server.properties"));
      const meta = readWorldMeta(serverName, d.name);
      const mods = listMods(serverName, d.name);
      return { name: d.name, ...props, ...meta, mods };
    });
}

export function getWorld(serverName: string, worldName: string): WorldData | null {
  const worldDir = getWorldDir(serverName, worldName);
  if (!fs.existsSync(worldDir)) return null;
  const props = parseServerProperties(path.join(worldDir, "server.properties"));
  const meta = readWorldMeta(serverName, worldName);
  const mods = listMods(serverName, worldName);
  return { name: worldName, ...props, ...meta, mods };
}

export function updateWorldMeta(serverName: string, worldName: string, meta: Partial<WorldMeta>): void {
  const current = readWorldMeta(serverName, worldName);
  writeWorldMeta(serverName, worldName, { ...current, ...meta });
}
