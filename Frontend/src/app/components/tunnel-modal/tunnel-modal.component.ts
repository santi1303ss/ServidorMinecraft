import { Component, output, inject, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "mc-tunnel-modal",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./tunnel-modal.component.html",
  styleUrls: ["./tunnel-modal.component.scss"],
})
export class TunnelModalComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  close = output<void>();

  minecraftTunnel = "";
  voiceChatTunnel = "";
  testResult = "";

  constructor() {
    this.api.getTunnels().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.minecraftTunnel = data.minecraft_tunnel || "";
        this.voiceChatTunnel = data.voice_chat_tunnel || "";
      },
    });
  }

  save() {
    this.api.updateTunnels({
      minecraft_tunnel: this.minecraftTunnel,
      voice_chat_tunnel: this.voiceChatTunnel,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: () => this.close.emit() });
  }

  test(host: string) {
    if (!host) return;
    this.testResult = "Testing...";
    this.api.ping(host).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => this.testResult = res.online ? "Online" : "Offline",
      error: () => this.testResult = "Error",
    });
  }
}
