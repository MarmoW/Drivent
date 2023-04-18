import { prisma } from '@/config';
import { PaymentInfo } from '@/protocols';

async function getPayment(ticketId: number) {
  return prisma.payment.findFirst({ where: { ticketId } });
}

async function postPayment({ ticketId, cardIssuer, cardLastDigits, value }: PaymentInfo) {
  return prisma.payment.create({ data: { ticketId, cardIssuer, cardLastDigits, value } });
}

const paymentRepository = { getPayment, postPayment };

export default paymentRepository;