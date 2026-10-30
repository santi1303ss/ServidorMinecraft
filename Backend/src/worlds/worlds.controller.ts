import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { WorldsService } from "./worlds.service.js";
import type { CreateWorldDto, UpdateWorldDto } from "../dto/world.dto.js";

@Controller("servers/:serverName/worlds")
export class WorldsController {
  constructor(private readonly worldsService: WorldsService) {}

  @Get()
  findAll(@Param("serverName") serverName: string) {
    return this.worldsService.findAll(serverName);
  }

  @Get(":worldName")
  findOne(@Param("serverName") serverName: string, @Param("worldName") worldName: string) {
    return this.worldsService.findOne(serverName, worldName);
  }

  @Post()
  create(
    @Param("serverName") serverName: string,
    @Body() body: CreateWorldDto,
  ) {
    return this.worldsService.create(serverName, body);
  }

  @Put(":worldName")
  update(
    @Param("serverName") serverName: string,
    @Param("worldName") worldName: string,
    @Body() body: UpdateWorldDto,
  ) {
    return this.worldsService.update(serverName, worldName, body);
  }

  @Delete(":worldName")
  remove(@Param("serverName") serverName: string, @Param("worldName") worldName: string) {
    return this.worldsService.remove(serverName, worldName);
  }

  @Post(":worldName/select")
  setActive(@Param("serverName") serverName: string, @Param("worldName") worldName: string) {
    return this.worldsService.setActive(serverName, worldName);
  }

  @Get(":worldName/progress")
  getProgress(@Param("serverName") serverName: string, @Param("worldName") worldName: string) {
    return this.worldsService.getProgress(serverName, worldName);
  }
}
