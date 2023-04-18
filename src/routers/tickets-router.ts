import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTicketType, getTicket, postTicket } from '@/controllers';
import { ticketIdSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter.all('*', authenticateToken);
ticketsRouter.get('/types', getTicketType);
ticketsRouter.get('/', getTicket);
ticketsRouter.post('/', validateBody(ticketIdSchema), postTicket);

export { ticketsRouter };
