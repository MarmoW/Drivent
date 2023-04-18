import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import paymentsService from '@/services/payments-service';
import { CardInfo } from '@/protocols';

export async function getPayment(req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.query as { ticketId: string };
  try {
    const payment = await paymentsService.getPayments(req.userId, parseInt(ticketId));
    
    res.status(httpStatus.OK).send(payment);
 
} catch (err) {
    if (err.name == 'UnauthorizedError') return res.status(httpStatus.UNAUTHORIZED).send(err.message);
    if (err.name == 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(err.message);    

    return res.status(httpStatus.BAD_REQUEST).send(err.message);
  }
}

export async function postPayment(req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.body as { ticketId: number };
  const { cardData } = req.body as { cardData: CardInfo };
  const { userId } = req;

  try {
    const payment = await paymentsService.postPayments(ticketId, cardData, userId);
    res.status(httpStatus.OK).send(payment);

  } catch (err) {
    if (err.name == 'UnauthorizedError') return res.status(httpStatus.UNAUTHORIZED).send(err.message);
    if (err.name == 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(err.message);
    return res.status(httpStatus.BAD_REQUEST).send(err.message);
  }
}