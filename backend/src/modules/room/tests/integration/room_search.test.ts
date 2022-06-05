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
import { Room } from '../domain/models/room';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let rooms: Room[];

describe('search rooms', () => {
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

  // ------------------------ RS-1 ------------------------

  it('(rs-1) invalid offset: not a number', async () => {
    const res = await request.get('/rooms?offset=ab');
    expect(res.status).toBe(400);
  });

  it('(rs-1) invalid offset: not an integer', async () => {
    const res = await request.get('/rooms?offset=3.5');
    expect(res.status).toBe(400);
  });

  it('(rs-1) invalid offset: less than 0', async () => {
    const res = await request.get('/rooms?offset=-1');
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-2 ------------------------

  it('(rs-2) invalid limit: not a number', async () => {
    const res = await request.get('/rooms?limit=hello');
    expect(res.status).toBe(400);
  });

  it('(rs-2) invalid limit: not an integer', async () => {
    const res = await request.get('/rooms?limit=10.34');
    expect(res.status).toBe(400);
  });

  it('(rs-2) invalid limit: less than 1', async () => {
    const res = await request.get('/rooms?limit=0');
    expect(res.status).toBe(400);
  });

  it('(rs-2) invalid limit: greater than 40', async () => {
    const res = await request.get('/rooms?limit=41');
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-3 ------------------------

  it('(rs-3) invalid floor: not present in the structure', async () => {
    const res = await request.get('/rooms?floor=10');
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-4 ------------------------

  it('(rs-4) partial time interval: end extreme not specified', async () => {
    const start = DateTime.utc()
      .startOf('hour')
      .plus({ hours: 2, minutes: 15 });
    const res = await request.get(`/rooms?start=${start.toISO()}`);
    expect(res.status).toBe(400);
  });

  it('(rs-4) partial time interval: start extreme not specified', async () => {
    const end = DateTime.utc().startOf('hour').plus({ hours: 2, minutes: 15 });
    const res = await request.get(`/rooms?end=${end.toISO()}`);
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-5 ------------------------

  it('(rs-5) invalid time interval: extremes are not dates', async () => {
    const res = await request.get(`/rooms?start=abc&end=123`);
    expect(res.status).toBe(400);
  });

  it('(rs-5) invalid time interval: extremes not multiple of 15 minutes', async () => {
    const start = DateTime.utc().plus({ minutes: 5 });
    const end = start.plus({ hours: 3, minutes: 1 });
    const res = await request.get(
      `/rooms?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-5) invalid time interval: extremes past interval', async () => {
    const end = DateTime.utc().startOf('day');
    const start = end.minus({ hours: 3 });
    const res = await request.get(
      `/rooms?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-5) invalid time interval: shorter than 15 minutes', async () => {
    const start = DateTime.utc().plus({ days: 2 }).startOf('day');
    const end = start.plus({ minutes: 1 });
    const res = await request.get(
      `/rooms?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-5) invalid time interval: longer than 1440 minutes', async () => {
    const start = DateTime.utc().plus({ days: 2 }).startOf('day');
    const end = start.plus({ hours: 25 });
    const res = await request.get(
      `/rooms?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-6 ------------------------

  it('(rs-6.1) successful search: no constraints', async () => {
    const res = await request.get('/rooms');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/rooms/${rooms[0].id!.to_string()}`,
        name: rooms[0].name,
        seats: rooms[0].seats,
        floor: rooms[0].floor,
        details: rooms[0].details,
      },
      {
        self: `/rooms/${rooms[1].id!.to_string()}`,
        name: rooms[1].name,
        seats: rooms[1].seats,
        floor: rooms[1].floor,
        details: rooms[1].details,
      },
      {
        self: `/rooms/${rooms[2].id!.to_string()}`,
        name: rooms[2].name,
        seats: rooms[2].seats,
        floor: rooms[2].floor,
        details: rooms[2].details,
      },
    ]);
  });

  it('(rs-6.2) successful search: limit constraint', async () => {
    const res = await request.get('/rooms?limit=1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/rooms/${rooms[0].id!.to_string()}`,
        name: rooms[0].name,
        seats: rooms[0].seats,
        floor: rooms[0].floor,
        details: rooms[0].details,
      },
    ]);
  });

  it('(rs-6.3) successful search: offset constraints', async () => {
    const res = await request.get('/rooms?offset=1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/rooms/${rooms[1].id!.to_string()}`,
        name: rooms[1].name,
        seats: rooms[1].seats,
        floor: rooms[1].floor,
        details: rooms[1].details,
      },
      {
        self: `/rooms/${rooms[2].id!.to_string()}`,
        name: rooms[2].name,
        seats: rooms[2].seats,
        floor: rooms[2].floor,
        details: rooms[2].details,
      },
    ]);
  });

  it('(rs-6.4) successful search: offset and limit constraints', async () => {
    const res = await request.get('/rooms?offset=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/rooms/${rooms[1].id!.to_string()}`,
        name: rooms[1].name,
        seats: rooms[1].seats,
        floor: rooms[1].floor,
        details: rooms[1].details,
      },
    ]);
  });

  it('(rs-6.5) successful search: floor constraint', async () => {
    const res = await request.get('/rooms?floor=1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/rooms/${rooms[0].id!.to_string()}`,
        name: rooms[0].name,
        seats: rooms[0].seats,
        floor: rooms[0].floor,
        details: rooms[0].details,
      },
    ]);
  });

  it('(rs-6.6) successful search: availability constraint', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).startOf('hour');
    const end = start.plus({ minutes: 30 });
    const res = await request.get(
      `/rooms?start=${start.toISO()}&end=${end.toISO()}`
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/rooms/${rooms[1].id!.to_string()}`,
        name: rooms[1].name,
        seats: rooms[1].seats,
        floor: rooms[1].floor,
        details: rooms[1].details,
      },
    ]);
  });

  // ------------------------ RS-7 ------------------------

  it('(rs-7) room info: non existing room', async () => {
    const res = await request.get('/rooms/0000000000');
    expect(res.status).toBe(404);
  });

  // ------------------------ RS-8 ------------------------

  it('(rs-8) room info', async () => {
    const res = await request.get(`/rooms/${rooms[0].id!.to_string()}`);
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({
      self: `/rooms/${rooms[0].id!.to_string()}`,
      name: rooms[0].name,
      seats: rooms[0].seats,
      floor: rooms[0].floor,
    });
  });

  // ------------------------ RS-9 ------------------------

  it('(rs-9) available slots: non existing room', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).startOf('hour');
    const end = start.plus({ minutes: 30 });
    const res = await request.get(
      `/rooms/0000000000/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(404);
  });

  // ------------------------ RS-12 ------------------------

  it('(rs-12) partial time interval: end extreme not specified', async () => {
    const start = DateTime.utc()
      .startOf('hour')
      .plus({ hours: 2, minutes: 15 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=${start.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-12) partial time interval: start extreme not specified', async () => {
    const end = DateTime.utc().startOf('hour').plus({ hours: 2, minutes: 15 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-13 ------------------------

  it('(rs-13) invalid time interval: extremes are not dates', async () => {
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=abc&end=123`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-13) invalid time interval: extremes not multiple of 15 minutes', async () => {
    const start = DateTime.utc().plus({ minutes: 5 });
    const end = start.plus({ hours: 3, minutes: 1 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-13) invalid time interval: extremes past interval', async () => {
    const end = DateTime.utc().startOf('day');
    const start = end.minus({ hours: 3 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-13) invalid time interval: shorter than 15 minutes', async () => {
    const start = DateTime.utc().plus({ days: 2 }).startOf('day');
    const end = start.plus({ minutes: 1 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  it('(rs-13) invalid time interval: longer than 1440 minutes', async () => {
    const start = DateTime.utc().plus({ days: 2 }).startOf('day');
    const end = start.plus({ hours: 25 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.status).toBe(400);
  });

  // ------------------------ RS-14 ------------------------

  it('(rs-14.1) available slots: room', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).startOf('hour');
    const end = start.plus({ minutes: 30 });
    const res = await request.get(
      `/rooms/${rooms[0].id!.to_string()}/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.body.length).toBe(0);
  });

  it('(rs-14.2) available slots: room', async () => {
    const start = DateTime.utc().plus({ hours: 1 }).startOf('hour');
    const end = start.plus({ hours: 15 });
    const res = await request.get(
      `/rooms/${rooms[1].id!.to_string()}/slots?start=${start.toISO()}&end=${end.toISO()}`
    );
    expect(res.body.length).toBe(1);
  });
});
