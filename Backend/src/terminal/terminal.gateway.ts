import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as pty from "node-pty";
import * as os from "os";
import * as path from "path";
import { getServerDir } from "../domain/index.js";

interface PtyEntry {
  pty: pty.IPty;
  serverName: string;
}

@WebSocketGateway({ cors: true })
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private ptys = new Map<string, PtyEntry>();

  handleConnection(client: Socket) {
    client.on("disconnect", () => this.killPty(client.id));
  }

  handleDisconnect(client: Socket) {
    this.killPty(client.id);
  }

  @SubscribeMessage("terminal:open")
  openTerminal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { serverName: string; worldName: string },
  ) {
    this.killPty(client.id);

    const cwd = path.join(getServerDir(data.serverName), data.worldName);
    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

    const ptyProc = pty.spawn(shell, [], {
      name: "xterm-256color",
      cols: 80,
      rows: 30,
      cwd,
      env: { ...process.env, TERM: "xterm-256color" } as any,
    });

    this.ptys.set(client.id, { pty: ptyProc, serverName: data.serverName });

    ptyProc.onData((data: string) => {
      client.emit("terminal:data", data);
    });

    ptyProc.onExit(() => {
      client.emit("terminal:exit");
      this.ptys.delete(client.id);
    });
  }

  @SubscribeMessage("terminal:input")
  handleInput(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { input: string },
  ) {
    const entry = this.ptys.get(client.id);
    if (entry) entry.pty.write(data.input);
  }

  @SubscribeMessage("terminal:resize")
  handleResize(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { cols: number; rows: number },
  ) {
    const entry = this.ptys.get(client.id);
    if (entry) entry.pty.resize(data.cols, data.rows);
  }

  @SubscribeMessage("terminal:close")
  handleClose(@ConnectedSocket() client: Socket) {
    this.killPty(client.id);
  }

  private killPty(clientId: string) {
    const entry = this.ptys.get(clientId);
    if (entry) {
      entry.pty.kill();
      this.ptys.delete(clientId);
    }
  }
}
