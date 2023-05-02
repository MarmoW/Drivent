import faker from '@faker-js/faker';
import dayjs from 'dayjs';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { TicketStatus } from '.prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';
 
import {
    createBooking,
    createEnrollmentWithAddress,
    createHotel,
    createRoomWithHotelId,
    createPayment,
    createTicketType,
    createTicket,
    createTicketTypeRemote,
    createTicketTypeWithHotel,
    createUser
} from '../factories';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/booking');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
        it('should respond with status 404 when user has no bookings ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            const pay = await createPayment(ticket.id, ticketType.price);
            const resp = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      
            expect(resp.status).toEqual(httpStatus.NOT_FOUND);
          });
  
      it('should respond with status 200 and with existing TicketTypes data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const newHotel = await createHotel();
        const newRoom = await createRoomWithHotelId(newHotel.id);
        const booking = await createBooking(user.id, newRoom.id);
  
        const resp = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(resp.status).toBe(httpStatus.OK);
        expect(resp.body).toEqual(
          {
            id: booking.id,
            Room:{
                id: newRoom.id,
                name: newRoom.name,
                capacity: newRoom.capacity,
                hotelId: newRoom.hotelId,
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            }
          },
        );
      });
    });
  });

  describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.post('/booking');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
      it('should respond with status 404 when room is nonexistent', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const pay = await createPayment(ticket.id, ticketType.price);

        const newHotel = await createHotel();
        const newRoom = await createRoomWithHotelId(newHotel.id);
  
        const resp = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id + 1 });
  
        expect(resp.statusCode).toEqual(httpStatus.NOT_FOUND);
      });

  
      it('should respond with status 403 when ticket is invalid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const pay = await createPayment(ticket.id, ticketType.price);
    
            const newHotel = await createHotel();
            const newRoom = await createRoomWithHotelId(newHotel.id);
      
            const resp = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id });
      
            expect(resp.status).toEqual(httpStatus.FORBIDDEN);
      });

      it('should respond with status 403 when room is already full', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const pay = await createPayment(ticket.id, ticketType.price);

        const newHotel = await createHotel();
        const newRoom = await createRoomWithHotelId(newHotel.id);

        const extrauser1 = await createUser();
        const extrauser2 = await createUser();
        const extrauser3 = await createUser();
        const extrabooking1 = await createBooking(extrauser1.id, newRoom.id);
        const extrabooking2 = await createBooking(extrauser2.id, newRoom.id);
        const extrabooking3 = await createBooking(extrauser3.id, newRoom.id);
  
        const resp = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id });
  
        expect(resp.status).toEqual(httpStatus.FORBIDDEN);
  });
      it('should respond with status 403 when user has no ticket', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        
        const newHotel = await createHotel();
        const newRoom = await createRoomWithHotelId(newHotel.id);

        const resp = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id });

        expect(resp.status).toEqual(httpStatus.FORBIDDEN);
});

      it('should respond with status 200 and with booking.id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
  
        const response = await server
          .post('/booking')
          .set('Authorization', `Bearer ${token}`)
          .send({ ticketTypeId: ticketType.id });
  
        expect(response.status).toEqual(httpStatus.CREATED);
        expect(response.body).toEqual({
          id: expect.any(Number),
          status: TicketStatus.RESERVED,
          ticketTypeId: ticketType.id,
          enrollmentId: enrollment.id,
          TicketType: {
            id: ticketType.id,
            name: ticketType.name,
            price: ticketType.price,
            isRemote: ticketType.isRemote,
            includesHotel: ticketType.includesHotel,
            createdAt: ticketType.createdAt.toISOString(),
            updatedAt: ticketType.updatedAt.toISOString(),
          },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });
  });
  
  describe('PUT /booking/:bookingId', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.put('/booking/1');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.post('/booking/1').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.post('/booking/1').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
        it('should respond with status 404 when room is nonexistent', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
           
            const newHotel = await createHotel();
            const newRoom = await createRoomWithHotelId(newHotel.id);
            const booking = await createBooking(user.id, newRoom.id);

            const resp = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: newRoom.id + 1 });
      
            expect(resp.statusCode).toEqual(httpStatus.NOT_FOUND);
          });
  
          it('should respond with status 403 when room is already full', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const pay = await createPayment(ticket.id, ticketType.price);
            
            const newHotel = await createHotel();
            const newRoom = await createRoomWithHotelId(newHotel.id);
            const secondNewRoom = await createRoomWithHotelId(newHotel.id);

            const extraUser1 = await createUser();
            const extraUser2 = await createUser();
            const extraUser3 = await createUser();
            const extraBooking1 = await createBooking(extraUser1.id, newRoom.id);
            const extraBooking2 = await createBooking(extraUser2.id, newRoom.id);
            const extraBooking3 = await createBooking(extraUser3.id, newRoom.id);

            const booking = await createBooking(user.id, newRoom.id);
      
            const resp = await server
                .put(`/booking/${booking.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ roomId: secondNewRoom.id });
      
            expect(resp.status).toEqual(httpStatus.FORBIDDEN);
      });
  
      it('should respond with status 200 and with booking.id', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const pay = await createPayment(ticket.id, ticketType.price);

        const newHotel = await createHotel();
        const newRoom = await createRoomWithHotelId(newHotel.id);
        const secondNewRoom = await createRoomWithHotelId(newHotel.id);

        const booking = await createBooking(user.id, newRoom.id);

        const response = await server
          .put(`/booking/${booking.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({roomId: secondNewRoom.id});
  
        
        expect(response.statusCode).toEqual(httpStatus.OK);
        expect(response.body).toEqual({
            bookingId: expect.any(Number),
          });
      });      
    });
  });
  