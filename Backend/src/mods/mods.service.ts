import { Injectable, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { listMods, saveMods, getWorldDir, type ModData } from "../domain/index.js";
import { CreateModDto } from "../dto/mod.dto.js";

@Injectable()
export class ModsService {
  async findAll(serverName: string, worldName: string): Promise<ModData[]> {
    return listMods(serverName, worldName);
  }

  async findOne(serverName: string, worldName: string, modId: string): Promise<ModData> {
    const mods = listMods(serverName, worldName);
    const mod = mods.find((m) => m.modId === modId);
    if (!mod) throw new NotFoundException(`Mod "${modId}" not found`);
    return mod;
  }

  async create(serverName: string, worldName: string, data: CreateModDto): Promise<ModData> {
    const mods = listMods(serverName, worldName);
    const fileName = this.sanitizeFileName(data.name) + ".jar";
    const mod: ModData = {
      name: data.name,
      modId: data.modId,
      fileName,
      enabled: true,
      source: data.source || "",
    };
    mods.push(mod);
    saveMods(serverName, worldName, mods);

    const modsDir = path.join(getWorldDir(serverName, worldName), "mods");
    fs.mkdirSync(modsDir, { recursive: true });

    return mod;
  }

  async toggle(serverName: string, worldName: string, modId: string): Promise<ModData> {
    const mods = listMods(serverName, worldName);
    const idx = mods.findIndex((m) => m.modId === modId);
    if (idx === -1) throw new NotFoundException(`Mod "${modId}" not found`);
    mods[idx] = { ...mods[idx], enabled: !mods[idx].enabled };
    saveMods(serverName, worldName, mods);
    return mods[idx];
  }

  async remove(serverName: string, worldName: string, modId: string): Promise<void> {
    const mods = listMods(serverName, worldName);
    const mod = mods.find((m) => m.modId === modId);
    if (!mod) throw new NotFoundException(`Mod "${modId}" not found`);

    const jarPath = path.join(getWorldDir(serverName, worldName), "mods", mod.fileName);
    if (fs.existsSync(jarPath)) fs.unlinkSync(jarPath);

    const updated = mods.filter((m) => m.modId !== modId);
    saveMods(serverName, worldName, updated);
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\s]/g, "_").replace(/_+/g, "_").slice(0, 200);
  }
}
