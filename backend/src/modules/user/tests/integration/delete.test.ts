/* eslint-disable no-console */
//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { User } from '../../src/domain/models/user';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';
import { get_token } from './util';

let driver: Driver;
let request: supertest.SuperTest<any>;

let users: User[];

let admin_token: string;
let simple_token: string;

describe('delete user account', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);

    admin_token = await get_token(request, users[0]);
    simple_token = await get_token(request, users[2]);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ UR-1 ------------------------

  it('(ur-1) attempt to remove account made by simple user', async () => {
    const res = await request
      .delete(`/users/${users[1].id!.to_string()}`)
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(403);
  });

  // ------------------------ UR-2 ------------------------

  it('(ur-2) successful removal', async () => {
    const res = await request
      .delete(`/users/${users[2].id!.to_string()}`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(204);
  });

  // ------------------------ UR-3 ------------------------

  it('(ur-3) non existing user', async () => {
    const res = await request
      .delete(`/users/0000000000`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(404);
  });
});

let token: string;

describe('unsubscribe', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);

    token = await get_token(request, users[1]);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ UR-1 ------------------------

  it('(uu-1) successful unsubscription (/users/me)', async () => {
    const res = await request.delete(`/users/me`).set('Cookie', `jwt=${token}`);

    expect(res.status).toBe(204);
  });

  it('(uu-1) successful unsubscription (/users/user-id)', async () => {
    const res = await request
      .delete(`/users/${users[2].id!.to_string()}`)
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(204);
  });
});
