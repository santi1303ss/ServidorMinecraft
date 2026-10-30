import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { execSync } from "child_process";
import { writeServerProperties, updateWorldMeta, MINECRAFT_DIR } from "../domain/index.js";

const VERSION_MANIFEST_URL = "https://launchermeta.mojang.com/mc/game/version_manifest.json";

const ENGINE_VERSIONS: Record<string, Record<string, string>> = {
  forge: { "1.21.1": "52.0.0", "1.20.4": "49.0.1", "1.20.1": "47.2.0" },
  fabric: { "1.21.1": "0.16.14", "1.20.4": "0.15.11", "1.20.1": "0.15.11" },
  neoforge: { "1.21.1": "21.1.77", "1.20.4": "20.4.237", "1.20.1": "20.4.237" },
};

const INSTALL_TIMEOUT = 120000;

interface WorldSettings {
  port: number;
  seed: string;
  gameMode: string;
  difficulty: string;
  pvp: boolean;
  maxPlayers: number;
  viewDistance: number;
  simulationDistance?: number;
  spawnProtection: number;
  enableCommands: boolean;
  bonusChest: boolean;
  motd?: string;
  onlineMode?: boolean;
}

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);
  private readonly progressMap = new Map<string, { status: string; progress: number; error: string }>();

  private key(serverName: string, worldName: string): string {
    return `${serverName}/${worldName}`;
  }

  getProgress(serverName: string, worldName: string) {
    return this.progressMap.get(this.key(serverName, worldName)) || { status: "pending", progress: 0, error: "" };
  }

  async setupWorld(
    serverName: string,
    worldName: string,
    engine: string,
    version: string,
    settings: WorldSettings,
  ) {
    const k = this.key(serverName, worldName);
    this.setProgress(k, "creating_folder", 0);

    try {
      const worldDir = path.join(MINECRAFT_DIR, serverName, worldName);
      fs.mkdirSync(worldDir, { recursive: true });
      this.setProgress(k, "creating_folder", 20);

      this.setProgress(k, "downloading_jar", 20);
      await this.downloadJar(worldDir, engine, version);
      this.setProgress(k, "downloading_jar", 70);

      this.setProgress(k, "generating_config", 70);
      writeServerProperties(path.join(worldDir, "server.properties"), {
        name: worldName,
        ...settings,
        seedType: "default",
      } as any);
      fs.writeFileSync(
        path.join(worldDir, "eula.txt"),
        "eula=true\n#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).\n",
        "utf-8",
      );
      updateWorldMeta(serverName, worldName, { setupStatus: "completed", setupProgress: 100, setupError: "" });
      this.setProgress(k, "completed", 100);
    } catch (err: any) {
      this.logger.error(`Setup failed for ${k}: ${err.message}`);
      updateWorldMeta(serverName, worldName, { setupStatus: "failed", setupProgress: 0, setupError: err.message });
      this.setProgress(k, "failed", 0, err.message || "Setup failed");
    }
  }

  private setProgress(k: string, status: string, progress: number, error = "") {
    this.progressMap.set(k, { status, progress, error });
  }

  private async downloadJar(worldDir: string, engine: string, version: string) {
    const handler = this.engineHandlers[engine];
    if (!handler) throw new Error(`Unsupported engine: ${engine}`);
    await handler(worldDir, version);
  }

  private readonly engineHandlers: Record<string, (worldDir: string, version: string) => Promise<void>> = {
    vanilla: (d, v) => this.downloadVanillaJar(d, v),
    fabric: (d, v) => this.runInstaller(d, v, "fabric"),
    forge: (d, v) => this.runInstaller(d, v, "forge"),
    neoforge: (d, v) => this.runInstaller(d, v, "neoforge"),
  };

  private async downloadVanillaJar(worldDir: string, version: string) {
    const manifest = await this.httpGet(VERSION_MANIFEST_URL);
    const versionData = manifest.versions.find((v: any) => v.id === version);
    if (!versionData) throw new Error(`Vanilla version ${version} not found`);

    const versionJson = await this.httpGet(versionData.url);
    const serverUrl = versionJson.downloads?.server?.url;
    if (!serverUrl) throw new Error(`No server jar for ${version}`);

    const jarPath = path.join(worldDir, "server.jar");
    await this.downloadFile(serverUrl, jarPath);
  }

  private async runInstaller(worldDir: string, version: string, engine: "fabric" | "forge" | "neoforge") {
    const engineVersion = ENGINE_VERSIONS[engine]?.[version];
    if (!engineVersion) throw new Error(`No ${engine} version for ${version}`);

    const config = this.getInstallerConfig(engine, version, engineVersion);
    const installerPath = path.join(worldDir, config.installerName);
    await this.downloadFile(config.installerUrl, installerPath);

    try {
      execSync(`java -jar "${installerPath}" ${config.installArgs}`, {
        cwd: worldDir,
        timeout: INSTALL_TIMEOUT,
      });
    } catch (err: any) {
      this.logger.warn(`${engine} installer failed, writing fallback start.bat: ${err.message}`);
      fs.writeFileSync(path.join(worldDir, "start.bat"), config.startBatContent);
    }
  }

  private getInstallerConfig(engine: string, version: string, engineVersion: string) {
    switch (engine) {
      case "fabric": {
        const loaderVersion = ENGINE_VERSIONS.fabric[version] || "0.15.11";
        return {
          installerName: "fabric-installer.jar",
          installerUrl: "https://maven.fabricmc.net/net/fabricmc/fabric-installer/1.0.0/fabric-installer-1.0.0.jar",
          installArgs: `server -mcversion ${version} -loader ${loaderVersion}`,
          startBatContent: `@echo off\njava -Xmx8G -jar fabric-server-mc-${version}-loader-${loaderVersion}-launchjar.jar nogui\npause`,
        };
      }
      case "forge":
        return {
          installerName: `forge-${version}-${engineVersion}-installer.jar`,
          installerUrl: `https://maven.minecraftforge.net/net/minecraftforge/forge/${version}-${engineVersion}/forge-${version}-${engineVersion}-installer.jar`,
          installArgs: "--installServer",
          startBatContent: `@echo off\njava -Xmx8G @libraries/net/minecraftforge/forge/${version}-${engineVersion}/win_args.txt nogui\npause`,
        };
      case "neoforge":
        return {
          installerName: `neoforge-${engineVersion}-installer.jar`,
          installerUrl: `https://maven.neoforged.net/releases/net/neoforged/neoforge/${engineVersion}/neoforge-${engineVersion}-installer.jar`,
          installArgs: "--installServer",
          startBatContent: `@echo off\njava -Xmx8G @libraries/net/neoforged/neoforge/${engineVersion}/win_args.txt nogui\npause`,
        };
      default:
        throw new Error(`Unknown engine: ${engine}`);
    }
  }

  private httpGet(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Invalid JSON response"));
          }
        });
        res.on("error", reject);
      }).on("error", reject);
    });
  }

  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destPath);
      https
        .get(url, (res) => {
          if (res.statusCode === 302 || res.statusCode === 301) {
            file.close(() => {
              fs.unlinkSync(destPath);
              this.downloadFile(res.headers.location!, destPath).then(resolve).catch(reject);
            });
            return;
          }
          res.pipe(file);
          res.on("end", () => file.close(() => resolve()));
          res.on("error", (err) => {
            file.close(() => {
              fs.unlinkSync(destPath);
              reject(err);
            });
          });
        })
        .on("error", (err) => {
          file.close(() => {
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            reject(err);
          });
        });
    });
  }
}
