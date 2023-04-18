import { notFoundError, unauthorizedError } from '@/errors';
import paymentRepository from '@/repositories/payment-repository';
import ticketRepository from '@/repositories/ticket-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { CardInfo } from '@/protocols';

export async function getPayments(userId: number, ticketId: number) {
  const typesTicket = await ticketRepository.getTicketsById(ticketId);
  if (!typesTicket) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  if (typesTicket.enrollmentId !== enrollment.id) {
    throw unauthorizedError();
  }

  const types = await paymentRepository.getPayment(ticketId);

  return types;
}

export async function postPayments(ticketId: number, cardData: CardInfo, userId: number) {
  const typesTicket = await ticketRepository.getTicketsById(ticketId);
  if (!typesTicket) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  if (typesTicket.enrollmentId !== enrollment.id) {
    throw unauthorizedError();
  }

  const ticketType = await ticketRepository.findTypesById(typesTicket.ticketTypeId);

  await paymentRepository.postPayment({
    ticketId,
    value: ticketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.toLocaleString().slice(-4),
  });

  await ticketRepository.confirmPayment(ticketId);

  const types = await paymentRepository.getPayment(ticketId);

  return types;
}

const paymentsService = { getPayments, postPayments };

export default paymentsService;