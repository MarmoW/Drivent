import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking, postBooking, putBooking } from '@/controllers/booking-controller';
//import { bookingSchemas } from '@/schemas';

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .post('/',  postBooking)
    .get('/', getBooking)
    .put('/:bookingId',  putBooking)

export {bookingRouter};