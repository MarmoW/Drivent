import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketsService from '@/services/tickets-service';

export async function getTicketType(_req: Request, res: Response) {
  try {
    const type = await ticketsService.getTicketTypes();
    return res.status(httpStatus.OK).send(type);
  } catch (err) {
    return res.status(httpStatus.NOT_FOUND).send({});
  }
}


export async function getTicket(req: AuthenticatedRequest, res:Response){

    try{
        const tickets = await ticketsService.getTickets(req.userId);
        res.status(httpStatus.OK).send(tickets);
    }catch(err){
      return res.status(httpStatus.NOT_FOUND).send({});
    }
}


export async function postTicket(req: AuthenticatedRequest, res: Response){
    try{
        const tickets = await ticketsService.postTickets(req.userId, req.body.ticketTypeId);
        res.status(httpStatus.OK).send(tickets);
    }catch(err){
      return res.status(httpStatus.NOT_FOUND).send({});
    }
}