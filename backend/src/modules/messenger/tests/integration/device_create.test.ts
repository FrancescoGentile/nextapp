//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('add new devices', () => {
  let users: User[];
  let driver: Driver;
  let request: supertest.SuperTest<any>;

  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const app = await init_app(driver, users[0].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // --------------------- DC-1 ---------------------

  it('(dc-1) add a device with the same token', async () => {
    const res = await request.post('/users/me/devices').send({
      name: 'Device3',
      token: users[0].devices[0].token.to_string(),
    });
    expect(res.status).toBe(409);
  });

  // --------------------- DC-2 ---------------------

  it('dec-2) missing name field', async () => {
    const res = await request.post('/users/me/devices').send({
      token: 'registrationtoken3',
    });

    expect(res.status).toBe(400);
  });

  // --------------------- DC-3 ---------------------

  it('(dc-3) successful creation of a new device', async () => {
    const res = await request.post('/users/me/devices').send({
      name: 'Device3',
      token: 'registrationtoken3',
      fingerprint: 'fingeprint3',
    });

    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(
      /^\/users\/me\/devices\/[0-9a-zA-Z_-]{11}$/
    );
  });
});
