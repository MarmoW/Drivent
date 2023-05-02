import { prisma } from "@/config";

async function findUserBooking(userId: number) {
    return prisma.booking.findFirst(
        {
            where: {
                userId: userId,
            }
        }
    )
};

async function findRoomById(roomId: number){
    return prisma.room.findFirst(
        {
            where: {
                id: roomId,
            }
        }
    )
};

async function findRoomBooking(roomId: number){
    return prisma.booking.findMany(
        {
            where:{
                roomId: roomId,
            }
        }
    )
};

async function createBooking(userId: number, roomId: number){
    return prisma.booking.create({
        data:{
            userId: userId,
            roomId: roomId,
        }
    })
};

async function updateBooking(bookingId: number, updatedRoomId: number){
    return prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            roomId: updatedRoomId,
        }

    })
};

async function updateRoomCapacity(roomId: number, updatedCapacity: number){
    return prisma.room.update({
        where: {
            id: roomId,
        },
        data:{
            capacity: updatedCapacity,
        }
    })
};

const bookingRepository = {
    findUserBooking,
    findRoomById,
    findRoomBooking,
    createBooking,
    updateBooking,
    updateRoomCapacity
};

export default bookingRepository;