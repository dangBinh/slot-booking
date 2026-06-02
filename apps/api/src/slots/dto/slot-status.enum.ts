import { registerEnumType } from '@nestjs/graphql';

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
}

registerEnumType(SlotStatus, { name: 'SlotStatus' });
