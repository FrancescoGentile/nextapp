//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import supertest from 'supertest';
import { Channel } from '../domain/models/channel';
import { User } from '../domain/models/user';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db, populate_users } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let channels: Channel[];
let users: User[];

describe('channel by id', () => {
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

  // ------------------------ SCN-1 ------------------------

  test('(scn-1) successful channel info retrieval by name', async () => {

    const res = await request.get(`/channels/${channels[0].id!.to_string()}`);
    expect(res.status).toBe(200);
    expect.arrayContaining([
      {
        self: `/api/v1/channels/${channels[0].id!.to_string()}`,
        name: channels[0].name,
        description: channels[0].description,
        presID_array: channels[0].presID_array
      }
    ]);
  });

  // ------------------------ SCN-2 ------------------------
  test('(scn-2) no-matching channel name found', async () => {
    const res = await request.get(`/channels/0123456789`);
    expect(res.status).toBe(404);
  });

})