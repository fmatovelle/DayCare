import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from './entities/classroom.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
  ) {}

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    console.log('Creating classroom with data:', createClassroomDto);
    
    const classroom = this.classroomRepository.create({
      name: createClassroomDto.name,
      description: createClassroomDto.description,
      ageGroupMin: createClassroomDto.ageGroupMin,
      ageGroupMax: createClassroomDto.ageGroupMax,
      capacity: createClassroomDto.capacity,
      centerId: createClassroomDto.centerId,
      isActive: true,
    });

    return this.classroomRepository.save(classroom);
  }

  async findAll(): Promise<Classroom[]> {
    return this.classroomRepository.find({
      where: { isActive: true },
      relations: ['center'], // This should load the center relationship
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Classroom> {
    const classroom = await this.classroomRepository.findOne({
      where: { id, isActive: true },
      relations: ['center'],
    });

    if (!classroom) {
      throw new NotFoundException('Aula no encontrada');
    }

    return classroom;
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto): Promise<Classroom> {
    const classroom = await this.findOne(id);
    
    Object.assign(classroom, {
      name: updateClassroomDto.name || classroom.name,
      description: updateClassroomDto.description !== undefined ? updateClassroomDto.description : classroom.description,
      ageGroupMin: updateClassroomDto.ageGroupMin || classroom.ageGroupMin,
      ageGroupMax: updateClassroomDto.ageGroupMax || classroom.ageGroupMax,
      capacity: updateClassroomDto.capacity || classroom.capacity,
      centerId: updateClassroomDto.centerId !== undefined ? updateClassroomDto.centerId : classroom.centerId,
    });

    const saved = await this.classroomRepository.save(classroom);
    
    // Reload with relations
    return this.classroomRepository.findOne({
      where: { id: saved.id },
      relations: ['center'],
    });
  }

  async remove(id: string): Promise<void> {
    const classroom = await this.findOne(id);
    classroom.isActive = false;
    await this.classroomRepository.save(classroom);
  }
}
