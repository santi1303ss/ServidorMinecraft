import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { spawn, execFile, ChildProcess } from "child_process";
import { listServers, getServer, saveServer, getServerDir, detectJavaVersions, getWorldDir, type ServerData } from "../domain/index.js";
import { CreateServerDto, UpdateServerDto } from "../dto/server.dto.js";

function getDefaultJava(): string {
  return detectJavaVersions()[0]?.path || "java";
}

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);
  private readonly processes = new Map<string, ChildProcess>();
  private readonly consoleBuffers = new Map<string, string[]>();

  async findAll(): Promise<ServerData[]> {
    return listServers();
  }

  async findOne(name: string): Promise<ServerData> {
    const server = getServer(name);
    if (!server) throw new NotFoundException(`Server "${name}" not found`);
    return server;
  }

  async create(data: CreateServerDto): Promise<ServerData> {
    const servers = listServers();
    if (servers.some((s) => s.name === data.name)) {
      throw new BadRequestException(`Server "${data.name}" already exists`);
    }
    const serverDir = getServerDir(data.name);
    fs.mkdirSync(serverDir, { recursive: true });
    const server: ServerData = {
      name: data.name,
      engine: data.engine || "vanilla",
      version: data.version || "1.21.1",
      gameDir: data.gameDir || path.join(os.homedir(), "Documents", "mc-servers", data.name),
      maxRam: data.maxRam || "4G",
      javaExec: data.javaExec || getDefaultJava(),
      jvmArgs: data.jvmArgs || "",
      status: "stopped",
      activeWorld: null,
    };
    saveServer(data.name, server);
    return server;
  }

  async update(name: string, data: UpdateServerDto): Promise<ServerData> {
    const server = await this.findOne(name);
    const updated = { ...server, ...data };
    saveServer(name, updated);
    return updated;
  }

  async remove(name: string): Promise<void> {
    await this.findOne(name);
    if (this.processes.has(name)) {
      this.processes.get(name)!.kill();
      this.processes.delete(name);
    }
    this.consoleBuffers.delete(name);
    const serverDir = getServerDir(name);
    fs.rmSync(serverDir, { recursive: true, force: true });
  }

  async start(name: string): Promise<ServerData> {
    const server = await this.findOne(name);
    if (server.status === "running") throw new BadRequestException("Server is already running");
    if (!server.activeWorld) throw new BadRequestException("No active world set");

    const worldDir = path.join(getServerDir(name), server.activeWorld);

    const updated = { ...server, status: "starting" as const };
    saveServer(name, updated);

    const javaExec = server.javaExec || getDefaultJava();
    const maxRam = server.maxRam || "4G";
    const jvmArgs = server.jvmArgs ? server.jvmArgs.split(/\s+/).filter(Boolean) : [];

    this.logger.log(`Starting server ${name} from ${worldDir}`);
    this.logger.log(`Using Java: ${javaExec} (exists: ${fs.existsSync(javaExec)})`);

    const argsFile = path.join(worldDir, "libraries", "net", "minecraftforge", "forge", "1.20.1-47.2.0", "win_args.txt");
    const javaArgs = [`-Xmx${maxRam}`, ...jvmArgs, `@${argsFile}`, "nogui"];
    this.logger.log(`Java args: ${javaArgs.join(" ")}`);

    const proc = spawn(javaExec, javaArgs, {
      cwd: worldDir,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.processes.set(name, proc);
    this.consoleBuffers.set(name, []);

    const pushLine = (line: string) => {
      const buf = this.consoleBuffers.get(name);
      if (buf) {
        buf.push(line);
        if (buf.length > 500) buf.splice(0, buf.length - 500);
      }
    };

    proc.stdout?.on("data", (chunk: Buffer) => {
      chunk.toString().split("\n").filter(Boolean).forEach(pushLine);
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      chunk.toString().split("\n").filter(Boolean).forEach(pushLine);
    });

    const logPath = path.join(worldDir, "logs", "latest.log");
    const checkReady = setInterval(() => {
      try {
        if (fs.existsSync(logPath)) {
          const log = fs.readFileSync(logPath, "utf-8");
          if (log.includes("Done!") || log.includes("For help, type \"help\"")) {
            clearInterval(checkReady);
            const s = getServer(name);
            if (s && s.status === "starting") {
              saveServer(name, { ...s, status: "running" });
              this.logger.log(`Server ${name} is ready`);
            }
          }
        }
      } catch {}
    }, 2000);

    proc.on("error", (err) => {
      clearInterval(checkReady);
      this.logger.error(`Server ${name} failed to start: ${err.message}`);
      this.processes.delete(name);
      saveServer(name, { ...server, status: "stopped" });
    });

    proc.on("exit", (code) => {
      clearInterval(checkReady);
      pushLine(`[Process exited with code ${code}]`);
      this.processes.delete(name);
      const s = getServer(name);
      if (s) saveServer(name, { ...s, status: "stopped" });
      this.logger.log(`Server ${name} exited with code ${code}`);
    });

    return updated;
  }

  async stop(name: string): Promise<ServerData> {
    const server = await this.findOne(name);
    if (server.status === "stopped") throw new BadRequestException("Server is already stopped");

    const proc = this.processes.get(name);
    if (proc) {
      proc.kill();
      this.processes.delete(name);
    }

    this.logger.log(`Stopping server ${name}`);
    const updated = { ...server, status: "stopped" as const };
    saveServer(name, updated);
    return updated;
  }

  async setActiveWorld(serverName: string, worldName: string | null): Promise<ServerData> {
    const server = await this.findOne(serverName);
    const updated = { ...server, activeWorld: worldName };
    saveServer(serverName, updated);
    return updated;
  }

  async getConsole(name: string, lines: number): Promise<string[]> {
    const buf = this.consoleBuffers.get(name);
    if (buf && buf.length > 0) return buf.slice(-lines);

    const server = await this.findOne(name);
    if (!server.activeWorld) return [];
    const logPath = path.join(getServerDir(name), server.activeWorld, "logs", "latest.log");
    try {
      if (!fs.existsSync(logPath)) return [];
      const content = fs.readFileSync(logPath, "utf-8");
      const allLines = content.split("\n").filter(Boolean);
      return allLines.slice(-lines);
    } catch {
      return [];
    }
  }

  async sendCommand(name: string, command: string): Promise<void> {
    const proc = this.processes.get(name);
    if (!proc || !proc.stdin) throw new BadRequestException("Server is not running");
    proc.stdin.write(command + "\n");
  }

  browseFolder(): Promise<string> {
    if (process.platform !== "win32") return Promise.resolve("");
    this.logger.log("browse requested: opening FolderBrowserDialog");
    const script =
      "Add-Type -AssemblyName System.Windows.Forms; " +
      "if (-not ('W32Fg' -as [type])) { Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public static class W32Fg{[DllImport(\"user32.dll\")]public static extern bool SetForegroundWindow(IntPtr h);}'; }; " +
      "$d = New-Object System.Windows.Forms.FolderBrowserDialog; " +
      "[void]$d.Handle; [W32Fg]::SetForegroundWindow($d.Handle) | Out-Null; " +
      "if ($d.ShowDialog() -eq 'OK') { Write-Output $d.SelectedPath }";
    return new Promise((resolve) => {
      execFile(
        "powershell.exe",
        ["-NoProfile", "-Command", script],
        { windowsHide: true, timeout: 120000 },
        (err, stdout) => resolve(err ? "" : stdout.trim()),
      );
    });
  }
}
