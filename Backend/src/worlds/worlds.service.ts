import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import { ServersService } from "../servers/servers.service.js";
import { SetupService } from "../setup/setup.service.js";
import { getWorld, listWorlds, saveServer, writeServerProperties, getWorldDir, type WorldData } from "../domain/index.js";
import { CreateWorldDto, UpdateWorldDto } from "../dto/world.dto.js";

@Injectable()
export class WorldsService {
  private readonly logger = new Logger(WorldsService.name);

  constructor(
    private serversService: ServersService,
    private setupService: SetupService,
  ) {}

  async findAll(serverName: string): Promise<WorldData[]> {
    await this.serversService.findOne(serverName);
    return listWorlds(serverName);
  }

  async findOne(serverName: string, worldName: string): Promise<WorldData> {
    const world = getWorld(serverName, worldName);
    if (!world) throw new NotFoundException(`World "${worldName}" not found in server "${serverName}"`);
    return world;
  }

  async create(serverName: string, data: CreateWorldDto): Promise<WorldData> {
    const server = await this.serversService.findOne(serverName);
    const world: WorldData = {
      name: data.name,
      port: 25565,
      serverIp: "",
      seed: data.seed || String(Math.floor(Math.random() * 1_000_000_000_000_000_000)),
      gameMode: data.gameMode || "survival",
      difficulty: data.difficulty || "normal",
      seedType: data.seedType || "default",
      bonusChest: data.bonusChest ?? false,
      enableCommands: data.enableCommands ?? false,
      generateStructures: data.generateStructures ?? true,
      pvp: data.pvp ?? true,
      maxPlayers: data.maxPlayers ?? 20,
      viewDistance: data.viewDistance ?? 10,
      simulationDistance: data.simulationDistance ?? 10,
      spawnProtection: data.spawnProtection ?? 16,
      onlineMode: data.onlineMode ?? true,
      motd: data.motd || "A Minecraft Server",
      whiteList: false,
      setupStatus: "pending",
      setupProgress: 0,
      setupError: "",
      mods: [],
    };

    void this.runSetup(serverName, world.name, server.engine, server.version, world);

    return world;
  }

  private async runSetup(
    serverName: string,
    worldName: string,
    engine: string,
    version: string,
    world: WorldData,
  ) {
    try {
      await this.setupService.setupWorld(
        serverName,
        worldName,
        engine,
        version,
        {
          port: world.port,
          seed: world.seed,
          gameMode: world.gameMode,
          difficulty: world.difficulty,
          pvp: world.pvp,
          maxPlayers: world.maxPlayers,
          viewDistance: world.viewDistance,
          simulationDistance: world.simulationDistance,
          spawnProtection: world.spawnProtection,
          enableCommands: world.enableCommands,
          bonusChest: world.bonusChest,
          motd: world.motd,
          onlineMode: world.onlineMode,
        },
      );
    } catch (err: any) {
      this.logger.error(`Setup failed for ${serverName}/${worldName}: ${err.message}`);
    }
  }

  async update(serverName: string, worldName: string, data: UpdateWorldDto): Promise<WorldData> {
    await this.findOne(serverName, worldName);
    const world = getWorld(serverName, worldName)!;
    const updated = { ...world, ...data };
    writeServerProperties(`${getWorldDir(serverName, worldName)}/server.properties`, updated);
    return updated;
  }

  async remove(serverName: string, worldName: string): Promise<void> {
    await this.findOne(serverName, worldName);
    fs.rmSync(getWorldDir(serverName, worldName), { recursive: true, force: true });
  }

  async setActive(serverName: string, worldName: string): Promise<WorldData> {
    const world = await this.findOne(serverName, worldName);
    const server = await this.serversService.findOne(serverName);
    saveServer(serverName, { ...server, activeWorld: worldName });
    return world;
  }

  getProgress(serverName: string, worldName: string) {
    return this.setupService.getProgress(serverName, worldName);
  }
}
