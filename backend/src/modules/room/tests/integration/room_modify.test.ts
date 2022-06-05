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
describe('modify room', () => {
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

  // ------------------------ RM-1 ------------------------

  it('(rm-1) simple user', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: 'RoomHello',
      floor: 3,
    });

    expect(res.status).toBe(403);
  });
});

// test for sys-admins
describe('modify room', () => {
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

  // ------------------------ RM-2 ------------------------

  it('(rm-2.1) successful change: name and floor', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: 'NewRoomName',
      floor: 2,
    });

    expect(res.status).toBe(204);
  });

  it('(rm-2.2) successful change: only name', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: 'NewRoomName',
    });

    expect(res.status).toBe(204);
  });

  it('(rm-2.3) successful change: only floor', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      floor: 2,
    });

    expect(res.status).toBe(204);
  });

  // ------------------------ RM-3 ------------------------

  it('(rm-3) already existing name', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: rooms[0].name,
    });

    expect(res.status).toBe(409);
  });

  // ------------------------ RM-4 ------------------------

  it('(rm-4.1) invalid name: shorter than 5 characters', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: 'name',
    });

    expect(res.status).toBe(400);
  });

  it('(rm-4.2) invalid name: longer than 100 characters', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: 'a'.repeat(101),
    });

    expect(res.status).toBe(400);
  });

  it('(rm-4.3) invalid name: invalid characters', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      name: 'Is This Valid?',
      seats: 2,
      floor: 3,
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RM-5 ------------------------

  it('(rm-5.1) invalid floor number: not a number', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      floor: 'hello',
    });

    expect(res.status).toBe(400);
  });

  it('(rm-5.2) invalid floor number: not an integer', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      floor: 2.3,
    });

    expect(res.status).toBe(400);
  });

  it('(rm-5.3) invalid floor number: not in the bounds', async () => {
    const res = await request.patch(`/rooms/${rooms[1].id!.to_string()}`).send({
      floor: 10,
    });

    expect(res.status).toBe(400);
  });
});
