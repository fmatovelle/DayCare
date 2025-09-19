import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Center } from './entities/center.entity';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';

@Injectable()
export class CentersService {
  constructor(
    @InjectRepository(Center)
    private readonly centerRepository: Repository<Center>,
  ) {}

  async create(createCenterDto: CreateCenterDto): Promise<Center> {
    console.log('Creating center with data:', createCenterDto);
    
    const center = this.centerRepository.create({
      name: createCenterDto.name,
      address: createCenterDto.address,
      phone: createCenterDto.phone,
      email: createCenterDto.email,
      capacity: createCenterDto.capacity,
      isActive: true,
    });

    return this.centerRepository.save(center);
  }

  async findAll(): Promise<Center[]> {
    return this.centerRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Center> {
    const center = await this.centerRepository.findOne({
      where: { id, isActive: true },
    });

    if (!center) {
      throw new NotFoundException('Centro no encontrado');
    }

    return center;
  }

  async update(id: string, updateCenterDto: UpdateCenterDto): Promise<Center> {
    const center = await this.findOne(id);
    Object.assign(center, updateCenterDto);
    return this.centerRepository.save(center);
  }

  async remove(id: string): Promise<void> {
    const center = await this.findOne(id);
    center.isActive = false;
    await this.centerRepository.save(center);
  }
}
