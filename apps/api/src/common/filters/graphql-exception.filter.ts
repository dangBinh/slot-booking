import { Catch, ArgumentsHost, ExceptionFilter, BadRequestException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainError, ErrorCode } from '../errors/domain.error';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter, ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    GqlArgumentsHost.create(host);

    if (exception instanceof DomainError) {
      return new GraphQLError(exception.message, {
        extensions: { code: exception.code },
      });
    }

    if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as { message?: string | string[] };
      const message = Array.isArray(res.message) ? res.message.join('; ') : res.message ?? exception.message;
      return new GraphQLError(message, { extensions: { code: ErrorCode.VALIDATION } });
    }

    if (exception instanceof Error) {
      return new GraphQLError(exception.message, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return new GraphQLError('Unknown error', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }
}
