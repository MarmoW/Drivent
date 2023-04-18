import { TicketType } from '@prisma/client';
import { prisma } from '@/config';

async function getTicketTypes(): Promise<TicketType[]>{
    return prisma.ticketType.FindMany();
}

async function getTicketsById(id: number) {
    return prisma.ticket.findUnique({
      where: { id,},
    });  }

  async function getTicket(enrollmentId: number) {
    return prisma.ticket.findFirst({ where: { enrollmentId }, include: { TicketType: true } });  }

  async function findTypesById(id: number): Promise<TicketType> {
    return prisma.ticketType.findUnique({
      where: {
        id,},
    });  }
  
  async function postTicket(enrollmentId: number, ticketTypeId: number) {
    return prisma.ticket.create({
      data: {
        enrollmentId,
        ticketTypeId,
        status: 'RESERVED', },
      include: {
        TicketType: true, },
    });  }
 
  async function confirmPayment(id: number) {
    return prisma.ticket.update({
      where: {id,},
      data: {status: 'PAID',},
    });  }


const ticketRepository = {
    getTicketTypes,
    getTicketsById,
    postTicket,
    findTypesById,
    confirmPayment,
    getTicket 
}

export default ticketRepository;