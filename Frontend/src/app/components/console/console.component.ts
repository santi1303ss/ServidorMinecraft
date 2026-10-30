import { Component, input, output, inject, signal, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "mc-console",
  standalone: true,
  templateUrl: "./console.component.html",
  styleUrls: ["./console.component.scss"],
})
export class ConsoleComponent implements AfterViewInit, OnDestroy {
  serverName = input.required<string>();
  worldName = input.required<string>();
  running = input(false);
  starting = input(false);
  closeTerminal = output<void>();

  @ViewChild("terminalContainer") termContainer!: ElementRef<HTMLDivElement>;

  private api = inject(ApiService);
  private socket!: Socket;
  private terminal!: Terminal;
  private fitAddon!: FitAddon;
  private written = 0;
  private pollTimer: ReturnType<typeof setInterval> | undefined;
  connected = signal(false);

  constructor() {
    effect(() => {
      const active = this.starting() || this.running();
      if (!this.terminal) return;
      if (active && !this.pollTimer) {
        this.pullConsole();
        this.pollTimer = setInterval(() => this.pullConsole(), 1500);
      } else if (!active && this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = undefined;
        this.pullConsole();
      }
    });
  }

  private pullConsole() {
    this.api.getConsole(this.serverName(), 300).subscribe({
      next: (lines) => {
        if (!this.terminal) return;
        if (this.written > lines.length) this.written = 0;
        for (let i = this.written; i < lines.length; i++) {
          this.terminal.write(lines[i] + "\r\n");
        }
        this.written = lines.length;
      },
      error: () => {},
    });
  }

  ngAfterViewInit() {
    this.terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "Cascadia Code, Fira Code, Consolas, monospace",
      theme: {
        background: "#0a0a0a",
        foreground: "#d4d4d4",
        cursor: "#4ade80",
        selectionBackground: "#264f78",
      },
    });

    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(this.termContainer.nativeElement);
    this.fitAddon.fit();

    this.socket = io(window.location.origin, { path: "/socket.io" });

    this.socket.on("connect", () => {
      this.connected.set(true);
      this.socket.emit("terminal:open", {
        serverName: this.serverName(),
        worldName: this.worldName(),
      });
    });

    this.socket.on("terminal:data", (data: string) => {
      this.terminal.write(data);
    });

    this.socket.on("terminal:exit", () => {
      this.terminal.write("\r\n\x1b[33m[Process exited]\x1b[0m\r\n");
      this.connected.set(false);
    });

    this.terminal.onData((data) => {
      if (this.connected()) {
        this.socket.emit("terminal:input", { input: data });
      }
    });

    new ResizeObserver(() => {
      if (this.fitAddon) {
        this.fitAddon.fit();
        if (this.connected()) {
          this.socket.emit("terminal:resize", {
            cols: this.terminal.cols,
            rows: this.terminal.rows,
          });
        }
      }
    }).observe(this.termContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.socket?.emit("terminal:close");
    this.socket?.disconnect();
    this.terminal?.dispose();
  }
}
