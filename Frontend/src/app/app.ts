import { Component, inject, signal, DestroyRef, ElementRef, ViewChild, computed } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { interval } from "rxjs";
import { FormsModule } from "@angular/forms";
import { HeaderComponent } from "./components/header/header.component";
import { ServerCardComponent } from "./components/server-card/server-card.component";
import { WorldCardComponent } from "./components/world-card/world-card.component";
import { ServerFormComponent } from "./components/server-form/server-form.component";
import { WorldFormComponent } from "./components/world-form/world-form.component";
import { TunnelModalComponent } from "./components/tunnel-modal/tunnel-modal.component";
import { LoadingOverlayComponent } from "./components/loading-overlay/loading-overlay.component";
import { ProgressModalComponent } from "./components/progress-modal/progress-modal.component";
import { ConsoleComponent } from "./components/console/console.component";
import { IconComponent } from "./components/icon/icon.component";
import { ApiService } from "./services/api.service";
import type { Server, World, ViewType } from "./models/api.models";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    FormsModule,
    HeaderComponent,
    ServerCardComponent,
    WorldCardComponent,
    ServerFormComponent,
    WorldFormComponent,
    TunnelModalComponent,
    LoadingOverlayComponent,
    ProgressModalComponent,
    ConsoleComponent,
    IconComponent,
  ],
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
})
export class App {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);

  @ViewChild("serverList") serverList?: ElementRef<HTMLElement>;
  @ViewChild("contentEl") contentEl?: ElementRef<HTMLElement>;

  servers = signal<Server[]>([]);
  worlds = signal<World[]>([]);
  worldDetail = signal<World | null>(null);
  view = signal<ViewType>("servers");
  selectedServer = signal<Server | null>(null);
  selectedWorld = signal<World | null>(null);
  loading = signal(false);
  loadingMsg = signal("");

  showServerForm = signal(false);
  showWorldForm = signal(false);
  showTunnelModal = signal(false);
  showSettings = signal(false);
  javaVersions = signal<{ name: string; path: string }[]>([]);
  nav = signal<'servers' | 'tunnels' | 'settings'>('servers');
  detailTab = signal<'console' | 'config' | 'mods'>('console');

  activeServers = computed(() => this.servers().filter(s => s.status === "running").length);

  constructor() {
    this.loadServers();
    interval(3000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.servers().some(s => s.status === "starting")) {
        this.api.getServers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (data) => this.servers.set(data),
        });
      }
      if (this.selectedServer()?.status === "starting") {
        this.api.getWorlds(this.selectedServer()!.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (data) => this.worlds.set(data),
        });
      }
    });
  }

  loadServers() {
    this.withLoading("Loading servers...");
    this.api.getServers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.servers.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  selectServer(server: Server) {
    this.selectedServer.set(server);
    this.withLoading("Loading worlds...");
    this.api.getWorlds(server.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.worlds.set(data); this.loading.set(false); this.view.set("worlds"); },
      error: () => this.loading.set(false),
    });
  }

  selectWorld(world: World) {
    this.selectedWorld.set(world);
    this.withLoading("Loading world...");
    this.api.getWorld(this.selectedServer()!.name, world.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.worldDetail.set(data); this.initWorldForm(); this.detailTab.set("console"); this.loading.set(false); this.view.set("detail"); },
      error: () => this.loading.set(false),
    });
  }

  goBack() {
    if (this.view() === "detail") {
      this.view.set("worlds");
      this.worldDetail.set(null);
      this.worldForm.set(null);
      this.worldFormSaved.set(null);
      this.selectedWorld.set(null);
    } else {
      this.view.set("servers");
      this.selectedServer.set(null);
      this.worlds.set([]);
    }
  }

  goHome() {
    this.view.set("servers");
    this.selectedServer.set(null);
    this.selectedWorld.set(null);
    this.worldDetail.set(null);
    this.worlds.set([]);
    this.nav.set("servers");
    this.contentEl?.nativeElement.scrollTo({ top: 0 });
  }

  scrollToList() {
    this.serverList?.nativeElement.scrollIntoView({ behavior: "smooth" });
  }

  openTunnels() {
    this.nav.set("tunnels");
    this.showTunnelModal.set(true);
  }

  closeTunnels() {
    this.showTunnelModal.set(false);
    this.nav.set("servers");
  }

  openSettings() {
    this.nav.set("settings");
    this.showSettings.set(true);
    this.api.detectJava().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (v) => this.javaVersions.set(v),
    });
  }

  closeSettings() {
    this.showSettings.set(false);
    this.nav.set("servers");
  }

  createServer(data: { name: string; engine: string; version: string; gameDir: string; maxRam: string; javaExec: string; jvmArgs: string }) {
    this.withLoading("Creating server...");
    this.api.createServer(data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.showServerForm.set(false); this.loadServers(); },
      error: () => this.loading.set(false),
    });
  }

  deleteServer(e: Event, name: string) {
    e.stopPropagation();
    this.withLoading("Deleting server...");
    this.api.deleteServer(name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadServers(),
      error: () => this.loading.set(false),
    });
  }

  createWorld(data: any) {
    this.withLoading("Creating world...");
    this.api.createWorld(this.selectedServer()!.name, data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.showWorldForm.set(false); this.loading.set(false); this.refreshWorlds(); },
      error: () => this.loading.set(false),
    });
  }

  deleteWorld(e: Event, worldName: string) {
    e.stopPropagation();
    this.api.deleteWorld(this.selectedServer()!.name, worldName).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.refreshWorlds(),
    });
  }

  selectActiveWorld(world: World) {
    this.withLoading("Selecting world...");
    this.api.selectWorld(this.selectedServer()!.name, world.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedServer.update(s => s ? { ...s, activeWorld: world.name } : s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startServer() {
    this.api.startServer(this.selectedServer()!.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedServer.update(s => s ? { ...s, status: "starting" } : s);
      },
    });
  }

  stopServer() {
    this.api.stopServer(this.selectedServer()!.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedServer.update(s => s ? { ...s, status: "stopped" } : s);
      },
    });
  }

  private refreshWorlds() {
    this.api.getWorlds(this.selectedServer()!.name).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.worlds.set(data),
    });
  }

  private withLoading(msg: string) {
    this.loading.set(true);
    this.loadingMsg.set(msg);
  }

  serverAddress(): string {
    const w = this.worldDetail();
    if (!w) return "";
    const host = w.serverIp?.trim() || "localhost";
    return `${host}:${w.port ?? 25565}`;
  }

  private initWorldForm() {
    const w = this.worldDetail();
    if (w) {
      const norm = { ...w, motd: !w.motd || w.motd === "A Minecraft Server" ? "" : w.motd };
      this.worldForm.set({ ...norm });
      this.worldFormSaved.set({ ...norm });
    }
  }

  worldForm = signal<Partial<World> | null>(null);
  worldFormSaved = signal<Partial<World> | null>(null);

  get worldDirty(): boolean {
    const f = this.worldForm();
    const s = this.worldFormSaved();
    if (!f || !s) return false;
    return Object.keys(f).some(k => f[k as keyof World] !== s[k as keyof World]);
  }

  onWorldInput(key: string, value: unknown) {
    this.worldForm.update(f => f ? { ...f, [key]: value } : f);
  }

  saveWorld() {
    const w = this.worldDetail();
    const f = this.worldForm();
    const s = this.selectedServer();
    if (!w || !f || !s || !this.worldDirty) return;
    this.api.updateWorld(s.name, w.name, f as any).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.worldFormSaved.set({ ...updated });
        this.worldForm.set({ ...updated });
        this.refreshWorlds();
      },
    });
  }

  copyIp() {
    navigator.clipboard.writeText(this.serverAddress());
  }
}
