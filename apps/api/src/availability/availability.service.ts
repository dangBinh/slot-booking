import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityInput } from './dto/create-availability.input';
import { rulesOverlap } from './rules-overlap';
import { AvailabilityInvalidError } from '../common/errors/availability-invalid.error';
import { AvailabilityOverlapError } from '../common/errors/availability-overlap.error';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function validate(input: CreateAvailabilityInput): void {
  if (input.weekday < 0 || input.weekday > 6) {
    throw new AvailabilityInvalidError('weekday must be 0..6');
  }
  if (!/^\d{2}:\d{2}$/.test(input.startTime) || !/^\d{2}:\d{2}$/.test(input.endTime)) {
    throw new AvailabilityInvalidError('time format must be HH:MM');
  }
  const start = toMinutes(input.startTime);
  const end = toMinutes(input.endTime);
  if (end <= start) {
    throw new AvailabilityInvalidError('endTime must be after startTime');
  }
  if (input.slotDurationMinutes <= 0) {
    throw new AvailabilityInvalidError('slotDurationMinutes must be positive');
  }
  if ((end - start) % input.slotDurationMinutes !== 0) {
    throw new AvailabilityInvalidError('slotDurationMinutes must evenly divide the window');
  }
}

@Injectable()
export class AvailabilityService {
  constructor(@InjectRepository(Availability) private readonly repo: Repository<Availability>) {}

  findForUser(userId: string): Promise<Availability[]> {
    return this.repo.find({ where: { userId } });
  }

  async create(input: CreateAvailabilityInput): Promise<Availability> {
    validate(input);
    const sameDay = await this.repo.find({ where: { userId: input.userId, weekday: input.weekday } });
    for (const existing of sameDay) {
      if (rulesOverlap(existing, input)) {
        throw new AvailabilityOverlapError();
      }
    }
    const entity = this.repo.create({
      userId: input.userId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      slotDurationMinutes: input.slotDurationMinutes,
    });
    return this.repo.save(entity);
  }

  async delete(id: string): Promise<{ id: string }> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Availability rule ${id} not found`);
    await this.repo.delete(id);
    return { id };
  }
}
