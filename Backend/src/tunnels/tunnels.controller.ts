import { Controller, Get, Put, Body, Query } from "@nestjs/common";
import { TunnelsService } from "./tunnels.service.js";
import type { UpdateTunnelsDto } from "../dto/tunnel.dto.js";

@Controller("tunnels")
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

  @Get()
  findAll() {
    return this.tunnelsService.findAll();
  }

  @Put()
  update(@Body() body: UpdateTunnelsDto) {
    return this.tunnelsService.update(body);
  }

  @Get("ping")
  ping(@Query("host") host: string) {
    return this.tunnelsService.ping(host);
  }
}
