//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import supertest from 'supertest';
import { Channel } from '../domain/models/channel';
import { User } from '../domain/models/user';
import { init_app } from './init_app';
import {
  init_driver,
  clear_db,
  close_driver,
  populate_db,
  populate_users,
} from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let channels: Channel[];
let users: User[];

describe('list channels', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ LC-1 ------------------------

  it('(lc-1) invalid offset: not a number', async () => {
    const res = await request.get('/channels?offset=ab');
    expect(res.status).toBe(400);
  });

  it('(lc-1) invalid offset: not an integer', async () => {
    const res = await request.get('/channels?offset=3.5');
    expect(res.status).toBe(400);
  });

  it('(lc-1) invalid offset: less than 0', async () => {
    const res = await request.get('/channels?offset=-1');
    expect(res.status).toBe(400);
  });

  // ------------------------ LC-2 ------------------------

  it('(lc-2) invalid limit: not a number', async () => {
    const res = await request.get('/channels?limit=hello');
    expect(res.status).toBe(400);
  });

  it('(lc-2) invalid limit: not an integer', async () => {
    const res = await request.get('/channels?limit=10.34');
    expect(res.status).toBe(400);
  });

  it('(lc-2) invalid limit: less than 1', async () => {
    const res = await request.get('/channels?limit=0');
    expect(res.status).toBe(400);
  });

  it('(lc-2) invalid limit: greater than 40', async () => {
    const res = await request.get('/channels?limit=41');
    expect(res.status).toBe(400);
  });

  // ------------------------ LC-3 ------------------------

  it('(lc-3) successful channel list retrieval: no constraints', async () => {
    const res = await request.get('/channels');
    expect(res.status).toBe(200);
    expect.arrayContaining([
      {
        self: `/ap1/v1/channels/${channels[0].id!.to_string()}`,
        name: channels[0].name,
        description: channels[0].description,
        presID_array: channels[0].presID_array,
      },
      {
        self: `/ap1/v1/channels/${channels[1].id!.to_string()}`,
        name: channels[1].name,
        description: channels[1].description,
        presID_array: channels[1].presID_array,
      },
    ]);
  });
});
