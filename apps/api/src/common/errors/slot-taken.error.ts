import { DomainError, ErrorCode } from './domain.error';
export class SlotTakenError extends DomainError {
  readonly code = ErrorCode.SLOT_TAKEN;
  constructor() { super('Slot is already booked'); }
}
