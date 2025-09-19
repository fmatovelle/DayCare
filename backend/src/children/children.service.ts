import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './entities/child.entity';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child)
    private readonly childRepository: Repository<Child>,
  ) {}

  async create(createChildDto: CreateChildDto): Promise<Child> {
    console.log('Creating child with data:', createChildDto);
    
    const child = this.childRepository.create({
      firstName: createChildDto.firstName,
      lastName: createChildDto.lastName,
      birthDate: new Date(createChildDto.birthDate),
      gender: createChildDto.gender,
      allergies: createChildDto.allergies || null,
      emergencyContactName: createChildDto.emergencyContactName || null,
      emergencyContactPhone: createChildDto.emergencyContactPhone || null,
      classroomId: createChildDto.classroomId || null,
      isActive: true,
    });

    return this.childRepository.save(child);
  }

  async findAll(): Promise<Child[]> {
    return this.childRepository.find({
      where: { isActive: true },
      relations: ['classroom'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Child> {
    const child = await this.childRepository.findOne({
      where: { id, isActive: true },
      relations: ['classroom'],
    });

    if (!child) {
      throw new NotFoundException('Niño no encontrado');
    }

    return child;
  }

  async update(id: string, updateChildDto: UpdateChildDto): Promise<Child> {
    const child = await this.findOne(id);
    
    if (updateChildDto.birthDate) {
      child.birthDate = new Date(updateChildDto.birthDate);
    }
    
    Object.assign(child, {
      firstName: updateChildDto.firstName || child.firstName,
      lastName: updateChildDto.lastName || child.lastName,
      gender: updateChildDto.gender || child.gender,
      allergies: updateChildDto.allergies !== undefined ? updateChildDto.allergies : child.allergies,
      emergencyContactName: updateChildDto.emergencyContactName !== undefined ? updateChildDto.emergencyContactName : child.emergencyContactName,
      emergencyContactPhone: updateChildDto.emergencyContactPhone !== undefined ? updateChildDto.emergencyContactPhone : child.emergencyContactPhone,
      classroomId: updateChildDto.classroomId !== undefined ? updateChildDto.classroomId : child.classroomId,
    });

    return this.childRepository.save(child);
  }

  async remove(id: string): Promise<void> {
    const child = await this.findOne(id);
    child.isActive = false;
    await this.childRepository.save(child);
  }
}
