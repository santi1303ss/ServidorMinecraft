import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { ServersService } from "./servers.service.js";
import { detectJavaVersions } from "../domain/index.js";
import type { CreateServerDto, UpdateServerDto } from "../dto/server.dto.js";

@Controller("servers")
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get("java")
  detectJava() {
    return detectJavaVersions();
  }

  @Get("browse")
  async browseFolder() {
    return { path: await this.serversService.browseFolder() };
  }

  @Get()
  findAll() {
    return this.serversService.findAll();
  }

  @Get(":name")
  findOne(@Param("name") name: string) {
    return this.serversService.findOne(name);
  }

  @Post()
  create(@Body() body: CreateServerDto) {
    return this.serversService.create(body);
  }

  @Put(":name")
  update(@Param("name") name: string, @Body() body: UpdateServerDto) {
    return this.serversService.update(name, body);
  }

  @Delete(":name")
  remove(@Param("name") name: string) {
    return this.serversService.remove(name);
  }

  @Post(":name/start")
  start(@Param("name") name: string) {
    return this.serversService.start(name);
  }

  @Post(":name/stop")
  stop(@Param("name") name: string) {
    return this.serversService.stop(name);
  }

  @Get(":name/console")
  getConsole(@Param("name") name: string, @Query("lines") lines?: string) {
    return this.serversService.getConsole(name, lines ? parseInt(lines, 10) : 100);
  }

  @Post(":name/console")
  sendCommand(@Param("name") name: string, @Body("command") command: string) {
    return this.serversService.sendCommand(name, command);
  }
}
