import { ApplicationError } from '@/protocols';

export function forbiddenError(): ApplicationError {
    return {
        name: 'ForbiddenError',
        message: 'you dont have permission to access this resource',
      };

}