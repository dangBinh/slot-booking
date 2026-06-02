import { DomainError, ErrorCode } from './domain.error';
export class UserNotFoundError extends DomainError {
  readonly code = ErrorCode.USER_NOT_FOUND;
  constructor(userId: string) { super(`User ${userId} not found`); }
}
