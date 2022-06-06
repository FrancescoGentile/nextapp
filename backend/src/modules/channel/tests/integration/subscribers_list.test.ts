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

  // ------------------------ LS-1 ------------------------

  test('(ls-1) successful subscribers list retrieval', async () => {
    const res = await request.get(`/channels/${channels[0].id!.to_string()}/subscribers`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: "/api/v1/channels/" + channels[0].id!.to_string() + "/subscribers/" + users[0].id!.to_string()
      },
      {
        self: "/api/v1/channels/" + channels[0].id!.to_string() + "/subscribers/" + users[1].id!.to_string()
      },
      {
        self: "/api/v1/channels/" + channels[0].id!.to_string() + "/subscribers/" + users[2].id!.to_string()
      },
      {
        self: "/api/v1/channels/" + channels[0].id!.to_string() + "/subscribers/" + users[4].id!.to_string()
      }
    ]);
    
  });
  
  test('(ls-1) sub retrieval for non-existing channel', async () => {
    const res = await request.get(`/channels/0123456789/subscribers`);
    expect(res.status).toBe(404);
  })

  test('(ls-1) sub retrieval for non valid channelID', async () => {
    const res = await request.get(`/channels/0/subscribers`);
    expect(res.status).toBe(400);
  })

})

  

//set requester to not president
describe('modify channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[5].id);
    request = supertest(app);
  });
  
  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  test('(ls-1) user not a president', async () => {
    const res = await request.get(`/channels/${channels[0].id!.to_string()}/subscribers`);
    expect(res.status).toBe(403);
  });

})