import { DomainError, ErrorCode } from './domain.error';
export class AvailabilityInvalidError extends DomainError {
  readonly code = ErrorCode.AVAILABILITY_INVALID;
  constructor(reason: string) { super(`Invalid availability rule: ${reason}`); }
}
