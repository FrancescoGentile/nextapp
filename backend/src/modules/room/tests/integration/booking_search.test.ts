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
import { Booking } from '../domain/models/booking';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let bookings: Booking[];

describe('search booking', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    bookings = res.bookings;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ BS-1 ------------------------

  it('(bs-1) partial time interval: missing start extreme', async () => {
    const end = DateTime.utc();
    const res = await request.delete(`/users/me/bookings?end=${end.toISO()}`);
    expect(res.status).toBe(400);
  });

  it('(bs-1) partial time interval: missing end extreme', async () => {
    const start = DateTime.utc();
    const res = await request.delete(
      `/users/me/bookings?start=${start.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(bs-1) partial time interval: missing both extremes', async () => {
    const res = await request.delete(`/users/me/bookings`);
    expect(res.status).toBe(400);
  });

  // ------------------------ BS-2 ------------------------

  it('(bs-1) invalid time interval: extremes are not dates', async () => {
    const res = await request.delete(`/users/me/bookings?start=123&end=hello`);
    expect(res.status).toBe(400);
  });

  it('(bs-2) invalid time interval: extremes not multiple of 15 minutes', async () => {
    const start = DateTime.utc();
    const end = start.plus({ minutes: 35 });
    const res = await request.delete(
      `/users/me/bookings?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(bs-2) invalid time interval: shorter than 15 minutes', async () => {
    const start = DateTime.utc().startOf('day');
    const end = start.plus({ minutes: 10 });
    const res = await request.delete(
      `/users/me/bookings?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(bs-2) invalid time interval: longer than 1440 minutes', async () => {
    const start = DateTime.utc().startOf('day');
    const end = start.plus({ hours: 25 });
    const res = await request.delete(
      `/users/me/bookings?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  // ------------------------ BS-3 ------------------------

  it('(bs-3) successful search 1', async () => {
    const start = DateTime.utc().startOf('day');
    const end = start.plus({ hours: 24 });
    const res = await request.delete(
      `/users/me/bookings?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      {
        self: `/users/me/bookings/${bookings[0].id!.to_string()}`,
        user: {
          self: '/users/me',
        },
        room: {
          self: `/rooms/${bookings[0].room.to_string()}`,
        },
        interval: bookings[0].interval.interval.toISO(),
      },
    ]);
  });

  it('(bs-3) successful search 2', async () => {
    const start = DateTime.utc().plus({ hours: 24 }).startOf('day');
    const end = start.plus({ hours: 24 });
    const res = await request.delete(
      `/users/me/bookings?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  // ------------------------ BS-4 ------------------------

  it('(bs-4) non existing booking', async () => {
    const res = await request.get(
      `/users/me/bookings/${bookings[1].id!.to_string()}`
    );
    expect(res.status).toBe(404);
  });

  it('(bs-4) invalid booking id', async () => {
    const res = await request.get('/users/me/bookings/abcd');
    expect(res.status).toBe(404);
  });

  // ------------------------ BS-5 ------------------------

  it('(bs-4) successful retrieval of booking', async () => {
    const res = await request.get(
      `/users/me/bookings/${bookings[0].id!.to_string()}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      self: `/users/me/bookings/${bookings[0].id!.to_string()}`,
      user: {
        self: '/users/me',
      },
      room: {
        self: `/rooms/${bookings[0].room.to_string()}`,
      },
      interval: bookings[0].interval.interval.toISO(),
    });
  });
});
