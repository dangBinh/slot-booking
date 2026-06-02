import { DomainError, ErrorCode } from './domain.error';
export class SlotNotInAvailabilityError extends DomainError {
  readonly code = ErrorCode.SLOT_NOT_IN_AVAILABILITY;
  constructor() { super('startAt does not align to any availability slot grid'); }
}
