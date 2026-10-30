import * as fs from "fs";
import * as path from "path";
import { getWorldDir } from "./paths.js";
import { readJson, writeJson } from "./json-io.js";
import type { ModData } from "./types.js";

export function listMods(serverName: string, worldName: string): ModData[] {
  const modsDir = path.join(getWorldDir(serverName, worldName), "mods");
  if (!fs.existsSync(modsDir)) return [];
  const modsJson = readJson<ModData[]>(path.join(modsDir, "mods.json"), []);
  const jarFiles = fs.readdirSync(modsDir).filter((f) => f.endsWith(".jar"));
  const existing = new Set(jarFiles);
  return modsJson.filter((m) => existing.has(m.fileName));
}

export function saveMods(serverName: string, worldName: string, mods: ModData[]): void {
  const modsDir = path.join(getWorldDir(serverName, worldName), "mods");
  fs.mkdirSync(modsDir, { recursive: true });
  writeJson(path.join(modsDir, "mods.json"), mods);
}
