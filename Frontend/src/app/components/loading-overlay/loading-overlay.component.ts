import { Component, input } from "@angular/core";

@Component({
  selector: "mc-loading-overlay",
  standalone: true,
  templateUrl: "./loading-overlay.component.html",
  styleUrls: ["./loading-overlay.component.scss"],
})
export class LoadingOverlayComponent {
  message = input<string>("Loading...");
}
