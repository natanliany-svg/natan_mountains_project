import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trail } from './entities/trail.entity.js';
import { Mountain } from '../mountains/entities/mountain.entity.js';
import { TrailsService } from './trails.service.js';
import { TrailsController } from './trails.controller.js';
import { AuthModule } from '../auth/auth.module.js';

// (#45)
@Module({
  imports: [TypeOrmModule.forFeature([Trail, Mountain]), AuthModule],
  controllers: [TrailsController],
  providers: [TrailsService],
})
export class TrailsModule {}
