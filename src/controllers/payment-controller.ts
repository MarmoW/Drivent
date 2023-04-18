import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import paymentsService from '@/services/payments-service';
import { CardInfo } from '@/protocols';

export async function getPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { ticketId } = req.query as { ticketId: string };
  try {
    const types = await paymentsService.getPayments(req.userId, parseInt(ticketId));
    res.status(httpStatus.OK).send(types);
  } catch (error) {
    next(error);
  }
}

export async function postPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { ticketId } = req.body as { ticketId: number };
  const { cardData } = req.body as { cardData: CardInfo };
  const { userId } = req;

  try {
    const types = await paymentsService.postPayments(ticketId, cardData, userId);
    res.status(httpStatus.OK).send(types);
  } catch (error) {
    next(error);
  }
}