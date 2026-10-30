import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'mc-mod-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mod-form.component.html',
  styleUrls: ['./mod-form.component.scss'],
})
export class ModFormComponent {
  close = output<void>();
  created = output<any>();

  modId = '';
  name = '';
  source = 'Modrinth';

  submit() {
    if (!this.modId || !this.name) return;
    this.created.emit({ modId: this.modId, name: this.name, source: this.source });
    this.close.emit();
  }
}
