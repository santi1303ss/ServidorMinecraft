import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'mc-world-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './world-form.component.html',
  styleUrls: ['./world-form.component.scss'],
})
export class WorldFormComponent {
  close = output<void>();
  created = output<any>();

  name = '';
  seed = '';
  gameMode = 'survival';
  difficulty = 'normal';
  bonusChest = false;
  enableCommands = false;
  generateStructures = true;
  pvp = true;
  onlineMode = true;
  maxPlayers = 20;
  viewDistance = 10;
  simulationDistance = 10;
  spawnProtection = 16;
  motd = '';

  submit() {
    if (!this.name) return;
    this.created.emit({
      name: this.name,
      seed: this.seed || '',
      gameMode: this.gameMode,
      difficulty: this.difficulty,
      bonusChest: this.bonusChest,
      enableCommands: this.enableCommands,
      generateStructures: this.generateStructures,
      pvp: this.pvp,
      onlineMode: this.onlineMode,
      maxPlayers: this.maxPlayers,
      viewDistance: this.viewDistance,
      simulationDistance: this.simulationDistance,
      spawnProtection: this.spawnProtection,
      motd: this.motd || 'A Minecraft Server',
    });
    this.close.emit();
  }
}
