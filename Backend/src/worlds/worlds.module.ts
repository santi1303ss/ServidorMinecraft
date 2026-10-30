import { Module } from "@nestjs/common";
import { WorldsService } from "./worlds.service.js";
import { WorldsController } from "./worlds.controller.js";
import { ServersModule } from "../servers/servers.module.js";
import { SetupModule } from "../setup/setup.module.js";

@Module({
  imports: [ServersModule, SetupModule],
  controllers: [WorldsController],
  providers: [WorldsService],
})
export class WorldsModule {}
