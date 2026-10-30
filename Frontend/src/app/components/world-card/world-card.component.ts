import { Component, output, input } from "@angular/core";
import { IconComponent } from "../icon/icon.component";
import type { World } from "../../models/api.models";

@Component({
  selector: "mc-world-card",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./world-card.component.html",
  styleUrls: ["./world-card.component.scss"],
})
export class WorldCardComponent {
  world = input.required<World>();
  isActive = input(false);
  setupStatus = input("completed");
  setupProgress = input(0);
  setupError = input("");
  select = output<void>();
  openDetail = output<void>();
  delete = output<Event>();

  formatStatus(status: string): string {
    const labels: Record<string, string> = {
      pending: "Pending...",
      creating_folder: "Creating folder...",
      downloading_jar: "Downloading server...",
      generating_config: "Generating config...",
      completed: "Completed",
      failed: "Failed",
    };
    return labels[status] || status;
  }
}
