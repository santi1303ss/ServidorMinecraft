import * as fs from "fs";
import * as path from "path";
import { MINECRAFT_DIR, getServerDir } from "./paths.js";
import { readJson, writeJson } from "./json-io.js";
import type { ServerData } from "./types.js";

const SERVER_DEFAULTS: ServerData = {
  name: "",
  engine: "vanilla",
  version: "1.21.1",
  gameDir: "",
  maxRam: "4G",
  javaExec: "",
  jvmArgs: "",
  status: "stopped",
  activeWorld: null,
};

export function listServers(): ServerData[] {
  if (!fs.existsSync(MINECRAFT_DIR)) return [];
  return fs.readdirSync(MINECRAFT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readJson<ServerData>(path.join(MINECRAFT_DIR, d.name, "server.json"), { ...SERVER_DEFAULTS, name: d.name }));
}

export function getServer(serverName: string): ServerData | null {
  const serverDir = getServerDir(serverName);
  if (!fs.existsSync(serverDir)) return null;
  return readJson<ServerData>(path.join(serverDir, "server.json"), { ...SERVER_DEFAULTS, name: serverName });
}

export function saveServer(serverName: string, data: ServerData): void {
  writeJson(path.join(getServerDir(serverName), "server.json"), data);
}
