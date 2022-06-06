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

// NOTE: here the order of users is different than the one in users
// here they are sorted by username
const users2 = [
  {
    self: '/users/1111111111',
    username: 'francesco_gentile',
    first_name: 'Francesco',
    surname: 'Gentile',
    is_admin: true,
  },
  {
    self: '/users/3333333333',
    username: 'lorenzo_cereser',
    first_name: 'Lorenzo',
    surname: 'Cereser',
    is_admin: false,
  },
  {
    self: '/users/2222222222',
    username: 'manuela_cortepause',
    first_name: 'Manuela',
    surname: 'Corte Pause',
    is_admin: false,
  },
];

describe('search users', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);

    admin_token = await get_token(request, users[0]);
    simple_token = await get_token(request, users[1]);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ USL-1 ------------------------

  it('(usl-1) attempt to view the list of all users made by a simple user', async () => {
    const res = await request
      .get(`/users`)
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(403);
  });

  // ------------------------ USL-2 ------------------------

  it('(usl-2) successful retrieval of users', async () => {
    const res = await request.get(`/users`).set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(users2);
  });

  it('(usl-2) successful retrieval of users (with limit)', async () => {
    const res = await request
      .get(`/users?limit=1`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(users2.slice(0, 1));
  });

  it('(usl-2) successful retrieval of users (with offset)', async () => {
    const res = await request
      .get(`/users?offset=1`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(users2.slice(1, 3));
  });

  it('(usl-2) successful retrieval of users (with limit and offset)', async () => {
    const res = await request
      .get(`/users?offset=1&limit=1`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(users2.slice(1, 2));
  });

  it('(usl-2) successful retrieval of users (with limit and offset)', async () => {
    const res = await request
      .get(`/users?offset=10&limit=1`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  // ------------------------ USL-3 ------------------------

  it('(usl-3) invalid offset: not a number', async () => {
    const res = await request
      .get(`/users?offset=abc`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });

  it('(usl-3) invalid offset: not an integer', async () => {
    const res = await request
      .get(`/users?offset=3.5`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });

  it('(usl-3) invalid offset: less than 0', async () => {
    const res = await request
      .get(`/users?offset=-1`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });

  // ------------------------ USL-3 ------------------------

  it('(usl-4) invalid limit: not a number', async () => {
    const res = await request
      .get(`/users?limit=1_2`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });

  it('(usl-4) invalid limit: not an integer', async () => {
    const res = await request
      .get(`/users?limit=1.2344`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });

  it('(usl-4) invalid limit: less than 1', async () => {
    const res = await request
      .get(`/users?limit=-1`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });

  it('(usl-4) invalid limit: greater than 40', async () => {
    const res = await request
      .get(`/users?limit=45`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(400);
  });
});

describe('get user info', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);

    admin_token = await get_token(request, users[0]);
    simple_token = await get_token(request, users[1]);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ USI-2 ------------------------

  it('(usi-2) non existing user', async () => {
    const res = await request
      .get(`/users/0000000000`)
      .set('Cookie', `jwt=${admin_token}`);

    expect(res.status).toBe(404);
  });

  // ------------------------ USI-3 ------------------------

  it('(usi-3) access user info', async () => {
    const res = await request
      .get(`/users/${users[0].id!.to_string()}`)
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(users2[0]);
  });

  // ------------------------ USI-3 ------------------------

  it('(usi-3) access your own info', async () => {
    const res = await request
      .get(`/users/me`)
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(users2[2]);
  });
});
