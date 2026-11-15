import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mountain } from './entities/mountain.entity.js';
import { MountainsService } from './mountains.service.js';
import { MountainsController } from './mountains.controller.js';
import { AuthModule } from '../auth/auth.module.js';

// (#38)
@Module({
  imports: [TypeOrmModule.forFeature([Mountain]), AuthModule],
  controllers: [MountainsController],
  providers: [MountainsService],
  exports: [MountainsService],
})
export class MountainsModule {}
