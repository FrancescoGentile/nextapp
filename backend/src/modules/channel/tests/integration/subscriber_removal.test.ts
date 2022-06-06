//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import supertest from 'supertest';
import { Channel } from '../domain/models/channel';
import { Sub } from '../domain/models/sub';
import { User } from '../domain/models/user';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let channels: Channel[];
let users: User[];
let subs: Sub[];

// set requester to president
describe('ban user', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;
    subs = res.supscriptions;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ SR-1 ------------------------

  it('(sr-1) ban on non-existing channel', async () => {

    const res = await request
      .delete(`/channels/0123456789/subscribers/${subs[4].id!.to_string()}`);
    
    expect(res.status).toBe(404);
  });

  // ------------------------ SR-2 ------------------------

  it('(sr-2) successful ban', async () => {
    
    const res = await request
      .delete(`/channels/${channels[0].id!.to_string()}/subscribers/${subs[4].id!.to_string()}`);

    expect(res.status).toBe(204);
  });

});

// set requester to simple subscriber
describe('unsubscribe', () => {
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

  // ------------------------ SR-3 ------------------------

  it('(sr-3) try to ban user while not president', async () => {
    
    const res = await request
      .delete(`/channels/${channels[0].id!.to_string()}/subscribers/${subs[4].id!.to_string()}`);

    expect(res.status).toBe(403);
  });

  it('(sr-4) user unsubscribe', async () => {
    const res = await request
      .delete(`/channels/${channels[0].id!.to_string()}/subscribers/${subs[5].id!.to_string()}`);

    expect(res.status).toBe(204);
  });
});  