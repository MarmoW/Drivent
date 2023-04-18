import { TicketType } from '@prisma/client';
import { notFoundError, unauthorizedError } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';


async function getTicketTypes(): Promise<TicketType[]> {
  const types = await ticketRepository.getTicketTypes();
  if (!types) throw notFoundError();

  return types;
}

async function getTickets(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
      throw notFoundError();
    }
    const types = await ticketRepository.getTicket(enrollment.id);
  
    if (!types) {
      throw notFoundError();
    }
  
    return types;
  }

  export async function postTickets(userId: number, ticketId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
      throw notFoundError();
    }
    const types = await ticketRepository.postTicket(enrollment.id, ticketId);

    if (!types) {
      throw notFoundError();
    }
  
    return types;
  }


const ticketsService = {
    getTicketTypes,
    getTickets,
    postTickets
};



export default ticketsService;