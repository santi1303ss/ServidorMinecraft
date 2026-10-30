import { Component, output, input } from "@angular/core";
import { IconComponent } from "../icon/icon.component";
import type { Mod } from "../../models/api.models";

@Component({
  selector: "mc-mod-card",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./mod-card.component.html",
  styleUrls: ["./mod-card.component.scss"],
})
export class ModCardComponent {
  mod = input.required<Mod>();
  toggle = output<void>();
  delete = output<Event>();
}
