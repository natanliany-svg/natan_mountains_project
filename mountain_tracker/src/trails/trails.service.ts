import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trail } from './entities/trail.entity.js';
import { Mountain } from '../mountains/entities/mountain.entity.js';
import { CreateTrailDto, UpdateTrailDto } from '../entities.dto.js';

// (#43)
@Injectable()
export class TrailsService {
  // (#43)
  constructor(
    @InjectRepository(Trail)
    private readonly trailRepository: Repository<Trail>,
    @InjectRepository(Mountain)
    private readonly mountainRepository: Repository<Mountain>,
  ) {}

  // (#43)
  async findByMountain(mountainId: number): Promise<Trail[]> {
    return await this.trailRepository.find({
      where: { mountainId },
      order: { id: 'ASC' },
    });
  }

  // (#43)
  async create(
    mountainId: number,
    createTrailDto: CreateTrailDto,
  ): Promise<Trail> {
    const mountain = await this.mountainRepository.findOne({
      where: { id: mountainId },
    });
    if (!mountain) {
      throw new NotFoundException('Mountain not found');
    }

    const trail = this.trailRepository.create({
      mountainId,
      name: createTrailDto.name,
      length: createTrailDto.length,
      estimatedTime: createTrailDto.estimatedTime,
      difficultyLevel: createTrailDto.difficultyLevel,
      isCircular: createTrailDto.isCircular,
    });
    return await this.trailRepository.save(trail);
  }

  // (#43)
  async update(id: number, updateTrailDto: UpdateTrailDto): Promise<Trail> {
    const trail = await this.trailRepository.findOne({ where: { id } });
    if (!trail) {
      throw new NotFoundException('Trail not found');
    }

    Object.assign(trail, updateTrailDto);
    return await this.trailRepository.save(trail);
  }

  // (#43)
  async remove(id: number): Promise<{ message: string }> {
    const trail = await this.trailRepository.findOne({ where: { id } });
    if (!trail) {
      throw new NotFoundException('Trail not found');
    }

    await this.trailRepository.remove(trail);
    return { message: 'Trail deleted successfully' };
  }
}
