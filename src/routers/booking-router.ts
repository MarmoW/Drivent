import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking, postBooking, putBooking } from '@/controllers/booking-controller';
import { bookingSchemas } from '@/schemas';

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .post('/', validateBody(bookingSchemas), postBooking)
    .get('/', getBooking)
    .put('/:bookingId', validateBody(bookingSchemas), putBooking)

export {bookingRouter};