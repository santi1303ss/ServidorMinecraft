import * as path from "path";
import * as os from "os";

export const MINECRAFT_DIR = path.join(os.homedir(), "Documents", "Minecraft");

export function getServerDir(serverName: string): string {
  return path.join(MINECRAFT_DIR, serverName);
}

export function getWorldDir(serverName: string, worldName: string): string {
  return path.join(MINECRAFT_DIR, serverName, worldName);
}
