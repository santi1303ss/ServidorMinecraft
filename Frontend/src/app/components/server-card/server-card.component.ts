import { Component, output, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconComponent } from "../icon/icon.component";
import type { Server } from "../../models/api.models";

@Component({
  selector: "mc-server-card",
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: "./server-card.component.html",
  styleUrls: ["./server-card.component.scss"],
})
export class ServerCardComponent {
  server = input.required<Server>();
  select = output<void>();
  delete = output<Event>();

  showConfirm = signal(false);
  confirmName = "";

  get canDelete(): boolean {
    return this.confirmName === this.server().name;
  }

  openConfirm(e: Event) {
    e.stopPropagation();
    this.confirmName = "";
    this.showConfirm.set(true);
  }

  confirmDelete(e: Event) {
    e.stopPropagation();
    if (this.canDelete) {
      this.showConfirm.set(false);
      this.delete.emit(e);
    }
  }

  cancelDelete(e: Event) {
    e.stopPropagation();
    this.showConfirm.set(false);
    this.confirmName = "";
  }
}
