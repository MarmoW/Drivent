import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketsService from '@/services/tickets-service';

export async function getTicketType(_req: Request, res: Response, next: NextFunction) {
  try {
    const type = await ticketsService.getTicketTypes();
    return res.status(httpStatus.OK).send(type);
  } catch (err) {
    next(err);
  }
}


export async function getTicket(req: AuthenticatedRequest, res:Response, next: NextFunction){

    try{
        const type = await ticketsService.getTickets(req.userId);
        res.status(httpStatus.OK).send(type);
    }catch(err){
        next(err);
    }
}


export async function postTicket(req: AuthenticatedRequest, res: Response, next:NextFunction){
    try{
        const type = await ticketsService.postTickets(req.userId, req.body.ticketTypeId);
        res.status(httpStatus.OK).send(type);
    }catch(err){
        next(err);
    }
}