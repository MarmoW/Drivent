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
        id: gbookings.id,
        room: findRoom
    }
}

async function verifyRoomCapacity(roomId: number){
    const vrooms = await bookingRepository.findRoomById(roomId);
    if(!vrooms) throw notFoundError();
    if(vrooms.capacity == 0) throw forbiddenError();
    const roomBookings = await bookingRepository.findRoomBooking(roomId);
    if(!roomBookings) throw notFoundError();
    if(roomBookings.length >= vrooms.capacity) throw forbiddenError(); 
}


async function createBookings(userId: number, roomId: number){
    const enrollments = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollments) throw forbiddenError();
    const tickets = await ticketsRepository.findTicketByEnrollmentId(enrollments.id);
    if (!tickets || tickets.TicketType.isRemote || tickets.TicketType.includesHotel || tickets.status == 'RESERVED') throw forbiddenError();
    await verifyRoomCapacity(roomId);
    const cbookings = await bookingRepository.createBooking(userId, roomId);
    return {
        bookingId: cbookings.id
    };
}

async function updateBookings(userId: number, roomId: number){
    const findbookings = await bookingRepository.findUserBooking(userId);
    if(!findbookings) throw notFoundError();
    const findrooms = await bookingRepository.findRoomById(roomId);
    if(!findrooms) throw notFoundError();
    if(findrooms.capacity == 0) throw forbiddenError();
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