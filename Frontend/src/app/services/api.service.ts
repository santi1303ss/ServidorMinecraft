import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Server, World, Mod, Version, Tunnels, PingResult } from "../models/api.models";

const API = "/api";

@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);

  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${API}/servers`);
  }

  createServer(data: { name: string; engine: string; version: string; gameDir: string; maxRam: string; javaExec: string; jvmArgs: string }): Observable<Server> {
    return this.http.post<Server>(`${API}/servers`, data);
  }

  deleteServer(name: string): Observable<void> {
    return this.http.delete<void>(`${API}/servers/${name}`);
  }

  startServer(name: string): Observable<Server> {
    return this.http.post<Server>(`${API}/servers/${name}/start`, {});
  }

  stopServer(name: string): Observable<Server> {
    return this.http.post<Server>(`${API}/servers/${name}/stop`, {});
  }

  getWorlds(serverName: string): Observable<World[]> {
    return this.http.get<World[]>(`${API}/servers/${serverName}/worlds`);
  }

  getWorld(serverName: string, worldName: string): Observable<World> {
    return this.http.get<World>(`${API}/servers/${serverName}/worlds/${worldName}`);
  }

  createWorld(serverName: string, data: any): Observable<World> {
    return this.http.post<World>(`${API}/servers/${serverName}/worlds`, data);
  }

  deleteWorld(serverName: string, worldName: string): Observable<void> {
    return this.http.delete<void>(`${API}/servers/${serverName}/worlds/${worldName}`);
  }

  selectWorld(serverName: string, worldName: string): Observable<World> {
    return this.http.post<World>(`${API}/servers/${serverName}/worlds/${worldName}/select`, {});
  }

  installMod(serverName: string, worldName: string, data: { name: string; modId: string; source?: string }): Observable<Mod> {
    return this.http.post<Mod>(`${API}/servers/${serverName}/worlds/${worldName}/mods`, data);
  }

  toggleMod(serverName: string, worldName: string, modId: string): Observable<Mod> {
    return this.http.put<Mod>(`${API}/servers/${serverName}/worlds/${worldName}/mods/${modId}/toggle`, {});
  }

  deleteMod(serverName: string, worldName: string, modId: string): Observable<void> {
    return this.http.delete<void>(`${API}/servers/${serverName}/worlds/${worldName}/mods/${modId}`);
  }

  getVersions(engine: string): Observable<Version[]> {
    return this.http.get<Version[]>(`${API}/versions/${engine}`);
  }

  detectJava(): Observable<{ name: string; path: string }[]> {
    return this.http.get<{ name: string; path: string }[]>(`${API}/servers/java`);
  }

  browseFolder(): Observable<{ path: string }> {
    return this.http.get<{ path: string }>(`${API}/servers/browse`);
  }

  getTunnels(): Observable<Tunnels> {
    return this.http.get<Tunnels>(`${API}/tunnels`);
  }

  updateTunnels(data: { minecraft_tunnel?: string; voice_chat_tunnel?: string }): Observable<Tunnels> {
    return this.http.put<Tunnels>(`${API}/tunnels`, data);
  }

  ping(host: string): Observable<PingResult> {
    return this.http.get<PingResult>(`${API}/tunnels/ping`, { params: { host } });
  }

  getConsole(serverName: string, lines?: number): Observable<string[]> {
    const params: any = {};
    if (lines) params.lines = lines;
    return this.http.get<string[]>(`${API}/servers/${serverName}/console`, { params });
  }

  sendCommand(serverName: string, command: string): Observable<void> {
    return this.http.post<void>(`${API}/servers/${serverName}/console`, { command });
  }

  updateWorld(serverName: string, worldName: string, data: any): Observable<World> {
    return this.http.put<World>(`${API}/servers/${serverName}/worlds/${worldName}`, data);
  }
}
