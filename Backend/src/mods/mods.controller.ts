import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { ModsService } from "./mods.service.js";
import type { CreateModDto } from "../dto/mod.dto.js";

@Controller("servers/:serverName/worlds/:worldName/mods")
export class ModsController {
  constructor(private readonly modsService: ModsService) {}

  @Get()
  findAll(@Param("serverName") serverName: string, @Param("worldName") worldName: string) {
    return this.modsService.findAll(serverName, worldName);
  }

  @Post()
  create(
    @Param("serverName") serverName: string,
    @Param("worldName") worldName: string,
    @Body() body: CreateModDto,
  ) {
    return this.modsService.create(serverName, worldName, body);
  }

  @Put(":modId/toggle")
  toggle(
    @Param("serverName") serverName: string,
    @Param("worldName") worldName: string,
    @Param("modId") modId: string,
  ) {
    return this.modsService.toggle(serverName, worldName, modId);
  }

  @Delete(":modId")
  remove(
    @Param("serverName") serverName: string,
    @Param("worldName") worldName: string,
    @Param("modId") modId: string,
  ) {
    return this.modsService.remove(serverName, worldName, modId);
  }
}
