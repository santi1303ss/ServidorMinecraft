import { Module } from "@nestjs/common";
import { ModsService } from "./mods.service.js";
import { ModsController } from "./mods.controller.js";

@Module({
  controllers: [ModsController],
  providers: [ModsService],
})
export class ModsModule {}
