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
import { init_driver, clear_db, close_driver, populate_db, populate_users } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let channels: Channel[];
let users: User[];
let subs: Sub[];
  

describe('me subscriptions', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;
    subs = res.supscriptions;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[4].id);
    request = supertest(app);
  });
  
  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });



 

// ------------------------ MCS-1 ------------------------

it('(mcs-1) invalid offset: not a number', async () => {
    const res = await request.get('/users/me/subscriptions?offset=ab');
    expect(res.status).toBe(400);
  });

  it('(mcs-1) invalid offset: not an integer', async () => {
    const res = await request.get('/users/me/subscriptions?offset=3.5');
    expect(res.status).toBe(400);
  });

  it('(mcs-1) invalid offset: less than 0', async () => {
    const res = await request.get('/users/me/subscriptions?offset=-1');
    expect(res.status).toBe(400);
  });

  // ------------------------ MCS-2 ------------------------

  it('(mcs-2) invalid limit: not a number', async () => {
    const res = await request.get('/users/me/subscriptions?limit=hello');
    expect(res.status).toBe(400);
  });

  it('(mcs-2) invalid limit: not an integer', async () => {
    const res = await request.get('/users/me/subscriptions?limit=10.34');
    expect(res.status).toBe(400);
  });

  it('(mcs-2) invalid limit: less than 1', async () => {
    const res = await request.get('/users/me/subscriptions?limit=0');
    expect(res.status).toBe(400);
  });

  it('(mcs-2) invalid limit: greater than 40', async () => {
    const res = await request.get('/users/me/subscriptions?limit=41');
    expect(res.status).toBe(400);
  });

  // ------------------------ MCS-3 ------------------------

  test('(mcs-3) successful subscription list retrieval', async () => {
    const res = await request.get('/users/me/subscriptions');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: "/api/v1/users/me/subscriptions/" + subs[1].id!.to_string(),
        channel: {
          self: "/api/v1/channels/" + channels[0].id!.to_string(),
        },
        user: {
          self: "/api/v1/users/" + users[4].id!.to_string()
        }
      },
      {
        self: "/api/v1/users/me/subscriptions/" + subs[6].id!.to_string(),
        channel: {
          self: "/api/v1/channels/" + channels[1].id!.to_string(),
        },
        user: {
          self: "/api/v1/users/" + users[4].id!.to_string()
        }
      }
    ]);
  });

})