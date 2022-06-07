/* eslint-disable import/extensions */
/* eslint-disable no-console */
//
//
//

import EventEmitter from 'eventemitter3';
import { DateTime } from 'luxon';
import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { Room } from '../../src/domain/models/room';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let rooms: Room[];

describe('create booking', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    rooms = res.rooms;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ BC-1 ------------------------

  it('(bc-1) missing room', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const end = start.plus({ hours: 2 });
    const res = await request.post(`/users/me/bookings`).send({
      start,
      end,
    });
    expect(res.status).toBe(400);
  });

  // ------------------------ BC-2 ------------------------

  it('(bc-2) non existing room', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const end = start.plus({ hours: 2 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: '/rooms/0000000000',
      },
      start,
      end,
    });
    expect(res.status).toBe(400);
  });

  // ------------------------ BC-3 ------------------------

  it('(bc-3) partial time interval: missing start extreme', async () => {
    const end = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      end,
    });
    expect(res.status).toBe(400);
  });

  it('(bc-3) partial time interval: missing end extreme', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      start,
    });
    expect(res.status).toBe(400);
  });

  it('(bc-3) partial time interval: missing both extremes', async () => {
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
    });
    expect(res.status).toBe(400);
  });

  // ------------------------ BC-4 ------------------------

  it('(bc-4) invalid time interval: past interval', async () => {
    const start = DateTime.utc().minus({ hours: 24 }).startOf('day');
    const end = start.plus({ hours: 2 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(400);
  });

  it('(bc-4) invalid time interval: shorter than 15 minutes', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const end = start.plus({ minutes: 10 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(400);
  });

  it('(bc-4) invalid time interval: longer than 1440 minutes', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const end = start.plus({ hours: 25 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(400);
  });

  it('(bc-4) invalid time interval: extremes not multiple of 15 minutes', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const end = start.plus({ minutes: 17 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(400);
  });

  // ------------------------ BC-5 ------------------------

  it('(bc-5) room fully occupied', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).startOf('hour');
    const end = start.plus({ hours: 2 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[2].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(409);
  });

  // ------------------------ BC-6 ------------------------

  it('(bc-6) overlapping booking', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).startOf('hour');
    const end = start.plus({ hours: 2 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[0].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(409);
  });

  // ------------------------ BC-7 ------------------------

  it('(bc-7) overlapping booking', async () => {
    const start = DateTime.utc().plus({ days: 2 }).startOf('hour');
    const end = start.plus({ hours: 2 });
    const res = await request.post(`/users/me/bookings`).send({
      room: {
        self: `/rooms/${rooms[2].id!.to_string()}`,
      },
      start,
      end,
    });
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(/^\/users\/me\/bookings\/\d{10}$/);
  });
});
