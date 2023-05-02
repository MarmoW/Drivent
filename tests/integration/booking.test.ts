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
    createhAddressWithCEP,
    createEvent,
    createHotel,
    createRoomWithHotelId,
    createPayment,
    generateCreditCardData,
    createSession,
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
  
        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual([
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
        ]);
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
      it('should respond with status 403 when room is nonexistent', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        await createTicketType();
  
        const response = await server.post('/tickets').set('Authorization', `Bearer ${token}`).send({});
  
        expect(response.status).toEqual(httpStatus.BAD_REQUEST);
      });
  
      it('should respond with status 404 when user doesnt have enrollment yet', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const ticketType = await createTicketType();
  
        const response = await server
          .post('/tickets')
          .set('Authorization', `Bearer ${token}`)
          .send({ ticketTypeId: ticketType.id });
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
  
      it('should respond with status 201 and with ticket data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
  
        const response = await server
          .post('/tickets')
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
  
      it('should insert a new ticket in the database', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
  
        const beforeCount = await prisma.ticket.count();
  
        await server.post('/tickets').set('Authorization', `Bearer ${token}`).send({ ticketTypeId: ticketType.id });
  
        const afterCount = await prisma.ticket.count();
  
        expect(beforeCount).toEqual(0);
        expect(afterCount).toEqual(1);
      });
    });
  });
  
  describe('POST /tickets', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.post('/tickets');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.post('/tickets').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.post('/tickets').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
      it('should respond with status 400 when ticketTypeId is not present in body', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        await createTicketType();
  
        const response = await server.post('/tickets').set('Authorization', `Bearer ${token}`).send({});
  
        expect(response.status).toEqual(httpStatus.BAD_REQUEST);
      });
  
      it('should respond with status 404 when user doesnt have enrollment yet', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const ticketType = await createTicketType();
  
        const response = await server
          .post('/tickets')
          .set('Authorization', `Bearer ${token}`)
          .send({ ticketTypeId: ticketType.id });
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
  
      it('should respond with status 201 and with ticket data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
  
        const response = await server
          .post('/tickets')
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
  
      it('should insert a new ticket in the database', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
  
        const beforeCount = await prisma.ticket.count();
  
        await server.post('/tickets').set('Authorization', `Bearer ${token}`).send({ ticketTypeId: ticketType.id });
  
        const afterCount = await prisma.ticket.count();
  
        expect(beforeCount).toEqual(0);
        expect(afterCount).toEqual(1);
      });
    });
  });
  