import { Module } from "@nestjs/common";
import { ServersModule } from "./servers/servers.module.js";
import { WorldsModule } from "./worlds/worlds.module.js";
import { ModsModule } from "./mods/mods.module.js";
import { VersionsModule } from "./versions/versions.module.js";
import { TunnelsModule } from "./tunnels/tunnels.module.js";
import { TerminalModule } from "./terminal/terminal.module.js";

@Module({
  imports: [ServersModule, WorldsModule, ModsModule, VersionsModule, TunnelsModule, TerminalModule],
})
export class AppModule {}
