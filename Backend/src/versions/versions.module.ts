import { Module } from '@nestjs/common';
import { VersionsService } from './versions.service.js';
import { VersionsController } from './versions.controller.js';

@Module({
  controllers: [VersionsController],
  providers: [VersionsService],
})
export class VersionsModule {}
