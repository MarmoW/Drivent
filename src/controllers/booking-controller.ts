import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import bookingService from '@/services/booking-service';

export async function postBooking(req: AuthenticatedRequest, res: Response, next: NextFunction){
    const {roomId} = req.body;
    const {userId} = req;
    try{
        const pbooking = await bookingService.createBookings(userId, roomId);
        
        return  res.status(httpStatus.CREATED).send(pbooking);

    }catch(err){
        next(err);
    }
}

export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction){
    const {userId} = req;
    try{
        const gbooking = await bookingService.getBookings(userId);
        return res.status(httpStatus.OK).send(gbooking);
    }catch(err){
        next(err);
    }
}

export async function putBooking(req: AuthenticatedRequest, res: Response, next: NextFunction){
    const {roomId} = req.body;
    const {userId} = req;
    try{
        const pbooking = await bookingService.updateBookings(userId, roomId);
        return res.status(httpStatus.OK).send(pbooking);
    }catch(err){
        next(err);
    }

}
