/* eslint-disable no-console */
//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { Channel } from '../domain/models/channel';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let channels: Channel[];

// set requester to simple user
describe('delete channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ CR-1 ------------------------

  it('(cr-1) attempt to remove channel made by simple user', async () => {
    // console.log(`/channels/${channels[1].id!.to_string()}`);
    const res = await request.delete(
      `/channels/${channels[1].id!.to_string()}`
    );
    expect(res.status).toBe(403);
  });
});

// ------------------------ CR-2 ------------------------

// set requester to admin
describe('delete channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[0].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  it('(cr-2) successful channel removal by sys-admin', async () => {
    const res = await request.delete(
      `/channels/${channels[1].id!.to_string()}`
    );

    expect(res.status).toBe(204);
  });

  // ------------------------ CR-3 ------------------------

  it('(cr-3) non existing channel', async () => {
    const res = await request.delete(`/channels/0000000001`);
    expect(res.status).toBe(404);
  });
});
