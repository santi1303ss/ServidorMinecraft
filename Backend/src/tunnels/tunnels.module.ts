import { Module } from '@nestjs/common';
import { TunnelsService } from './tunnels.service.js';
import { TunnelsController } from './tunnels.controller.js';

@Module({
  controllers: [TunnelsController],
  providers: [TunnelsService],
})
export class TunnelsModule {}
