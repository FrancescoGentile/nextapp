/* eslint-disable import/extensions */
/* eslint-disable no-console */
//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { Room } from '../domain/models/room';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let rooms: Room[];

// test for simple users
describe('create room', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ RC-1 ------------------------

  it('(rc-1) simple user', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(403);
  });
});

// test for sys-admins
describe('create room', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    rooms = res.rooms;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[0].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ RC-3 ------------------------

  it('(rc-3) non unique name', async () => {
    const res = await request.post('/rooms').send({
      name: rooms[0].name,
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(409);
  });

  // ------------------------ RC-4 ------------------------

  it('(rc-4) name not specified', async () => {
    const res = await request.post('/rooms').send({
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RC-5 ------------------------

  it('(rc-5) invalid name: shorter than 5 characters', async () => {
    const res = await request.post('/rooms').send({
      name: 'name',
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  it('(rc-5) invalid name: longer than 100 characters', async () => {
    const res = await request.post('/rooms').send({
      name: 'a'.repeat(101),
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  it('(rc-5) invalid name: invalid characters', async () => {
    const res = await request.post('/rooms').send({
      name: 'Is This Valid?',
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RC-6 ------------------------

  it('(rc-6) seats not specified', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RC-7 ------------------------

  it('(rc-7) invalid number of seats: not a number', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 'abc',
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  it('(rc-7) invalid number of seats: not an integer', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 3.5,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  it('(rc-7) invalid number of seats: less than 1', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 0,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RC-8 ------------------------

  it('(rc-8) floor not specified', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 2,
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RC-9 ------------------------

  it('(rc-9) invalid floor number: not a number', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 2,
      floor: 'hello',
    });

    expect(res.status).toBe(400);
  });

  it('(rc-9) invalid floor number: not an integer', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 2,
      floor: 2.3,
    });

    expect(res.status).toBe(400);
  });

  it('(rc-9) invalid floor number: not in the bounds', async () => {
    const res = await request.post('/rooms').send({
      name: 'RoomHello',
      seats: 2,
      floor: 10,
    });

    expect(res.status).toBe(400);
  });
});
