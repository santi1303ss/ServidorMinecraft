import { Injectable, Logger } from "@nestjs/common";
import * as net from "net";
import { UpdateTunnelsDto } from "../dto/tunnel.dto.js";

@Injectable()
export class TunnelsService {
  private readonly logger = new Logger(TunnelsService.name);
  private tunnels = { minecraft_tunnel: "", voice_chat_tunnel: "" };

  findAll() {
    return this.tunnels;
  }

  update(data: UpdateTunnelsDto) {
    if (data.minecraft_tunnel !== undefined) this.tunnels.minecraft_tunnel = data.minecraft_tunnel;
    if (data.voice_chat_tunnel !== undefined) this.tunnels.voice_chat_tunnel = data.voice_chat_tunnel;
    return this.tunnels;
  }

  async ping(host: string): Promise<{ online: boolean; error?: string }> {
    return new Promise((resolve) => {
      const { hostname, port } = this.parseHost(host);
      const socket = net.createConnection({ host: hostname, port, timeout: 3000 });
      socket.on("connect", () => { socket.destroy(); resolve({ online: true }); });
      socket.on("error", () => { socket.destroy(); resolve({ online: false, error: "connection failed" }); });
      socket.on("timeout", () => { socket.destroy(); resolve({ online: false, error: "timeout" }); });
    });
  }

  private parseHost(host: string): { hostname: string; port: number } {
    const defaultPort = 25565;
    if (host.startsWith("[")) {
      const bracketEnd = host.indexOf("]");
      if (bracketEnd === -1) return { hostname: host, port: defaultPort };
      const hostname = host.slice(1, bracketEnd);
      const afterBracket = host.slice(bracketEnd + 1);
      const port = afterBracket.startsWith(":") ? parseInt(afterBracket.slice(1), 10) || defaultPort : defaultPort;
      return { hostname, port };
    }
    const lastColon = host.lastIndexOf(":");
    if (lastColon === -1) return { hostname: host, port: defaultPort };
    const hostname = host.slice(0, lastColon);
    const port = parseInt(host.slice(lastColon + 1), 10) || defaultPort;
    return { hostname, port };
  }
}
