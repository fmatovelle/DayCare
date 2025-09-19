import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  // Helper function to format time properly
  private formatTimeString(timeString: string): string {
    const date = new Date(timeString);
    return date.toTimeString().slice(0, 8); // Returns "HH:MM:SS"
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        childId: createAttendanceDto.childId,
        date: new Date(createAttendanceDto.date),
      },
    });

    if (existingAttendance) {
      throw new ConflictException('Ya existe un registro de asistencia para este niño en esta fecha');
    }

    const attendance = this.attendanceRepository.create({
      childId: createAttendanceDto.childId,
      date: new Date(createAttendanceDto.date),
      checkInTime: createAttendanceDto.checkIn ? this.formatTimeString(createAttendanceDto.checkIn) : null,
      checkOutTime: createAttendanceDto.checkOut ? this.formatTimeString(createAttendanceDto.checkOut) : null,
      checkInNotes: createAttendanceDto.notes || null,
      status: createAttendanceDto.checkIn ? 'present' : 'absent',
      isActive: true,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findAll(date?: string, childId?: string, classroomId?: string): Promise<Attendance[]> {
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('child.classroom', 'classroom')
      .where('attendance.isActive = :isActive', { isActive: true });

    if (date) {
      query.andWhere('attendance.date = :date', { date: new Date(date) });
    }

    if (childId) {
      query.andWhere('attendance.childId = :childId', { childId });
    }

    if (classroomId) {
      query.andWhere('child.classroomId = :classroomId', { classroomId });
    }

    return query
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('attendance.checkInTime', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['child', 'child.classroom'],
    });

    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    
    if (updateAttendanceDto.checkIn) {
      attendance.checkInTime = this.formatTimeString(updateAttendanceDto.checkIn);
      attendance.status = 'present';
    }
    
    if (updateAttendanceDto.checkOut) {
      attendance.checkOutTime = this.formatTimeString(updateAttendanceDto.checkOut);
    }
    
    if (updateAttendanceDto.notes) {
      attendance.checkInNotes = updateAttendanceDto.notes;
    }

    return this.attendanceRepository.save(attendance);
  }

  async remove(id: string): Promise<void> {
    const attendance = await this.findOne(id);
    attendance.isActive = false;
    await this.attendanceRepository.save(attendance);
  }

  async checkIn(childId: string, date: string, checkIn: string): Promise<Attendance> {
    const existingAttendance = await this.attendanceRepository.findOne({
      where: { childId, date: new Date(date), isActive: true },
    });

    if (existingAttendance) {
      if (existingAttendance.checkInTime) {
        throw new ConflictException('El niño ya tiene check-in registrado para esta fecha');
      }
      existingAttendance.checkInTime = this.formatTimeString(checkIn);
      existingAttendance.status = 'present';
      return this.attendanceRepository.save(existingAttendance);
    }

    return this.create({ childId, date, checkIn });
  }

  async checkOut(childId: string, date: string, checkOut: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { childId, date: new Date(date), isActive: true },
    });

    if (!attendance || !attendance.checkInTime) {
      throw new NotFoundException('No se encontró check-in para este niño en esta fecha');
    }

    if (attendance.checkOutTime) {
      throw new ConflictException('El niño ya tiene check-out registrado');
    }

    attendance.checkOutTime = this.formatTimeString(checkOut);
    return this.attendanceRepository.save(attendance);
  }

  // REPORT METHODS (simplified - keeping existing logic)
  async getDailyReport(date: string, classroomId?: string): Promise<any> {
    console.log('Getting daily report for date:', date);
    
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('child.classroom', 'classroom')
      .where('attendance.date = :date AND attendance.isActive = :isActive', { 
        date: new Date(date), 
        isActive: true 
      });

    if (classroomId) {
      query.andWhere('child.classroomId = :classroomId', { classroomId });
    }

    const attendanceRecords = await query.getMany();

    const stats = {
      date,
      totalPresent: attendanceRecords.filter(a => a.checkInTime).length,
      totalCheckedOut: attendanceRecords.filter(a => a.checkOutTime).length,
      stillPresent: attendanceRecords.filter(a => a.checkInTime && !a.checkOutTime).length,
      averageArrivalTime: null,
      averageDepartureTime: null,
      attendanceRate: 0,
    };

    return {
      stats,
      records: attendanceRecords,
    };
  }

  async getWeeklyReport(startDate: string, endDate: string, classroomId?: string): Promise<any> {
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.child', 'child')
      .leftJoinAndSelect('child.classroom', 'classroom')
      .where('attendance.date BETWEEN :startDate AND :endDate AND attendance.isActive = :isActive', { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate),
        isActive: true 
      });

    if (classroomId) {
      query.andWhere('child.classroomId = :classroomId', { classroomId });
    }

    const attendanceRecords = await query.getMany();

    const dailyStats = {};
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          present: 0,
          checkedOut: 0,
          records: []
        };
      }
      dailyStats[dateKey].records.push(record);
      if (record.checkInTime) dailyStats[dateKey].present++;
      if (record.checkOutTime) dailyStats[dateKey].checkedOut++;
    });

    return {
      period: { startDate, endDate },
      dailyBreakdown: Object.values(dailyStats),
      totalDays: Object.keys(dailyStats).length,
      totalAttendances: attendanceRecords.filter(a => a.checkInTime).length,
    };
  }

  async getChildAttendanceReport(childId: string, startDate: string, endDate: string): Promise<any> {
    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        childId,
        date: Between(new Date(startDate), new Date(endDate)),
        isActive: true,
      },
      relations: ['child'],
      order: { date: 'ASC' },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.checkInTime).length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      childId,
      period: { startDate, endDate },
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      records: attendanceRecords,
    };
  }

  async getAttendanceStats(date: string): Promise<any> {
    const records = await this.attendanceRepository.find({
      where: { date: new Date(date), isActive: true },
    });

    return {
      date,
      totalRecords: records.length,
      checkedIn: records.filter(r => r.checkInTime).length,
      checkedOut: records.filter(r => r.checkOutTime).length,
      stillPresent: records.filter(r => r.checkInTime && !r.checkOutTime).length,
      absent: records.filter(r => !r.checkInTime).length,
    };
  }
}
