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

// user is president
describe('managed channels', () => {
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

  it('(mc-1) invalid offset: not a number', async () => {
    const res = await request.get('/users/me/president?offset=ab');
    expect(res.status).toBe(400);
  });

  it('(mc-1) invalid offset: not an integer', async () => {
    const res = await request.get('/users/me/president?offset=3.5');
    expect(res.status).toBe(400);
  });

  it('(mc-1) invalid offset: less than 0', async () => {
    const res = await request.get('/users/me/president?offset=-1');
    expect(res.status).toBe(400);
  });

  // ------------------------ LC-2 ------------------------

  it('(mc-2) invalid limit: not a number', async () => {
    const res = await request.get('/users/me/president?limit=hello');
    expect(res.status).toBe(400);
  });

  it('(mc-2) invalid limit: not an integer', async () => {
    const res = await request.get('/users/me/president?limit=10.34');
    expect(res.status).toBe(400);
  });

  it('(mc-2) invalid limit: less than 1', async () => {
    const res = await request.get('/users/me/president?limit=0');
    expect(res.status).toBe(400);
  });

  it('(mc-2) invalid limit: greater than 40', async () => {
    const res = await request.get('/users/me/president?limit=41');
    expect(res.status).toBe(400);
  });

  // ------------------------ LC-3 ------------------------

  it('(mc-3) successful channel list retrieval: no constraints', async () => {
    const res = await request.get('/users/me/president');
    expect(res.status).toBe(200);
    expect.arrayContaining([
      {
        self: `/ap1/v1/channels/${channels[0].id!.to_string()}`,
        name: channels[0].name,
        description: channels[0].description,
        presID_array: channels[0].presID_array,
      },
    ]);
  });
});

// user is not president

describe('managed channels', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[2].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  it('(mc-4) non-president user try to retrieve managed channels', async () => {
    const res = await request.get('/users/me/president');
    expect(res.status).toBe(403);
  });
});
