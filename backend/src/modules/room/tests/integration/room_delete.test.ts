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
describe('delete room', () => {
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

  // ------------------------ RC-1 ------------------------

  it('(rd-1) simple user', async () => {
    const res = await request.delete(`/rooms/${rooms[0].id!.to_string()}`);
    expect(res.status).toBe(403);
  });
});

// test for sys-admins
describe('delete room', () => {
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

  // ------------------------ RC-2 ------------------------

  it('(rc-2) successful delete', async () => {
    const res = await request.delete(`/rooms/${rooms[1].id!.to_string()}`);
    expect(res.status).toBe(204);
  });

  // ------------------------ RC-3 ------------------------

  it('(rc-2) non existing room', async () => {
    const res = await request.delete(`/rooms/0000000000`);
    expect(res.status).toBe(404);
  });
});
