import { Controller, Get, Param } from '@nestjs/common';
import { VersionsService } from './versions.service.js';

@Controller("versions")
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get(':engine')
  findByEngine(@Param('engine') engine: string) {
    return this.versionsService.findByEngine(engine);
  }
}
