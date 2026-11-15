import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Mountain } from './entities/mountain.entity.js';
import { CreateMountainDto, UpdateMountainDto } from '../entities.dto.js';

// (#34)
@Injectable()
export class MountainsService {
  // (#34)
  constructor(
    @InjectRepository(Mountain)
    private readonly mountainRepository: Repository<Mountain>,
  ) {}

  // (#34)
  async findAll(): Promise<Mountain[]> {
    return await this.mountainRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // (#34)
  async search(query?: string): Promise<Mountain[]> {
    if (!query || !query.trim()) {
      return await this.findAll();
    }
    const term = `%${query.trim()}%`;
    return await this.mountainRepository.find({
      where: [{ name: Like(term) }, { location: Like(term) }],
      order: { createdAt: 'DESC' },
    });
  }

  // (#34)
  async findOne(id: number): Promise<Mountain> {
    const mountain = await this.mountainRepository.findOne({ where: { id } });
    if (!mountain) {
      throw new NotFoundException('Mountain not found');
    }
    return mountain;
  }

  // (#35)
  async create(createMountainDto: CreateMountainDto): Promise<Mountain> {
    const mountain = this.mountainRepository.create(createMountainDto);
    return await this.mountainRepository.save(mountain);
  }

  // (#35)
  async update(
    id: number,
    updateMountainDto: UpdateMountainDto,
  ): Promise<Mountain> {
    const mountain = await this.findOne(id);
    Object.assign(mountain, updateMountainDto);
    return await this.mountainRepository.save(mountain);
  }

  // (#35)
  async remove(id: number): Promise<{ message: string }> {
    const mountain = await this.findOne(id);
    await this.mountainRepository.remove(mountain);
    return { message: 'Mountain deleted successfully' };
  }
}
