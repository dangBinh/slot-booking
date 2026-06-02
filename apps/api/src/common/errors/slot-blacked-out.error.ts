import { DomainError, ErrorCode } from './domain.error';
export class SlotBlackedOutError extends DomainError {
  readonly code = ErrorCode.SLOT_BLACKED_OUT;
  constructor() { super('Slot is blocked by the provider'); }
}
