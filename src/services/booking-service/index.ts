import bookingRepository from "@/repositories/booking-repository";
import { notFoundError, forbiddenError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import ticketService from "../tickets-service";

async function getBookings(userId: number){
    const gbookings = await bookingRepository.findUserBooking(userId);
    if(!gbookings) throw notFoundError();
    const findRoom = await bookingRepository.findRoomById(gbookings.roomId);
    return {
        Room: findRoom,
        id: gbookings.id
    }
}

async function verifyRoomCapacity(roomId: number){
    const room = await bookingRepository.findRoomById(roomId);

    if(!room) throw notFoundError();
    if(room.capacity == 0) throw notFoundError();

    const roomBookings = await bookingRepository.findRoomBooking(roomId);

    if(roomBookings.length >= room.capacity) throw forbiddenError(); 
    
}


async function createBookings(userId: number, roomId: number){

    await verifyRoomCapacity(roomId);

    const enrollments = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollments) throw forbiddenError();

    const tickets = await ticketsRepository.findTicketByEnrollmentId(enrollments.id);
    if (!tickets || tickets.TicketType.isRemote || tickets.TicketType.includesHotel || tickets.status == 'RESERVED') throw forbiddenError();

    const cbookings = await bookingRepository.createBooking(userId, roomId);

    return {
        bookingId: cbookings.id
    };
}

async function updateBookings(userId: number, roomId: number){

    const findbookings = await bookingRepository.findUserBooking(userId);
    if(!findbookings) throw notFoundError();
    
    await verifyRoomCapacity(roomId);    
    
    await bookingRepository.updateBooking(findbookings.id, roomId);

    return {
        bookingId: findbookings.id
    };
}

export default {
    getBookings,
    createBookings,
    updateBookings
}