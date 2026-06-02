import { DomainError, ErrorCode } from './domain.error';
export class AvailabilityOverlapError extends DomainError {
  readonly code = ErrorCode.AVAILABILITY_OVERLAP;
  constructor() { super('Rule overlaps an existing availability window for this weekday'); }
}
