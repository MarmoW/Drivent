import { Router } from 'express';
import { authenticateToken, validateBody} from '@/middlewares';
import { getPayment, postPayment } from '@/controllers';
import { PaySchema } from '@/schemas';

const paymentsRouter = Router();

paymentsRouter.all('*', authenticateToken)
paymentsRouter.get('/',  getPayment)
paymentsRouter.post('/process', validateBody(PaySchema), postPayment);

export { paymentsRouter };