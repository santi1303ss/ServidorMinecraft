import { Component, input } from "@angular/core";
import type { World } from "../../models/api.models";

@Component({
  selector: "mc-progress-modal",
  standalone: true,
  templateUrl: "./progress-modal.component.html",
  styleUrls: ["./progress-modal.component.scss"],
})
export class ProgressModalComponent {
  worlds = input<World[]>([]);

  get activeWorld() {
    return this.worlds().find((w) => w.setupStatus !== "completed" && w.setupStatus !== "failed") || null;
  }

  get show() {
    return this.activeWorld !== null;
  }

  formatStatus(status: string): string {
    const labels: Record<string, string> = {
      pending: "Initializing...",
      creating_folder: "Creating folder...",
      downloading_jar: "Downloading server jar...",
      generating_config: "Generating config files...",
      completed: "Setup complete!",
      failed: "Setup failed",
    };
    return labels[status] || status;
  }
}
