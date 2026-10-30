import { Component, output, inject, signal, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "mc-server-form",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./server-form.component.html",
  styleUrls: ["./server-form.component.scss"],
})
export class ServerFormComponent {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  close = output<void>();
  created = output<{ name: string; engine: string; version: string; gameDir: string; maxRam: string; javaExec: string; jvmArgs: string }>();

  name = "";
  engine = "";
  version = "";
  gameDir = "";
  maxRam = "4G";
  javaExec = "";
  jvmArgs = "";
  versions = signal<string[]>([]);
  javaVersions = signal<{ name: string; path: string }[]>([]);
  private folderDialogOpen = false;

  constructor() {
    this.api.detectJava().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.javaVersions.set(data),
    });
  }

  pickFolder() {
    if (this.folderDialogOpen) return;
    this.folderDialogOpen = true;
    this.api.browseFolder().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.folderDialogOpen = false))).subscribe({
      next: (r) => {
        if (r.path) this.gameDir = r.path;
      },
    });
  }

  onEngineChange() {
    this.version = "";
    if (this.engine) {
      this.api.getVersions(this.engine).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data) => this.versions.set(data.map((v) => v.version)),
        error: () => this.versions.set([]),
      });
    } else {
      this.versions.set([]);
    }
  }

  submit() {
    if (!this.name || !this.engine || !this.version) return;
    this.created.emit({
      name: this.name,
      engine: this.engine,
      version: this.version,
      gameDir: this.gameDir,
      maxRam: this.maxRam,
      javaExec: this.javaExec,
      jvmArgs: this.jvmArgs,
    });
    this.close.emit();
  }
}
