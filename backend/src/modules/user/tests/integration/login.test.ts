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

let driver: Driver;
let request: supertest.SuperTest<any>;

let users: User[];

// test for simple users
describe('login', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ UL-1 ------------------------

  it('(ul-1) successful login', async () => {
    const res = await request.post('/login').send({
      username: users[0].credentials.username.to_string(),
      password: 'ReallyComplicatedPassword',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.expires).toBeDefined();
  });

  // ------------------------ UL-2 ------------------------

  it('(ul-2) wrong username', async () => {
    const res = await request.post('/login').send({
      username: 'notexistinguser',
      password: 'ReallyComplicatedPassword',
    });

    expect(res.status).toBe(401);
  });

  it('(ul-2) invalid username', async () => {
    const res = await request.post('/login').send({
      username: 'invalid username',
      password: 'ReallyComplicatedPassword',
    });

    expect(res.status).toBe(401);
  });

  // ------------------------ UL-3 ------------------------

  it('(ul-3) wrong password', async () => {
    const res = await request.post('/login').send({
      username: users[0].credentials.username.to_string(),
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
  });

  // ------------------------ UL-4 ------------------------

  it('(ul-4) partial credentials: username not present', async () => {
    const res = await request.post('/login').send({
      password: 'WrongPassword',
    });

    expect(res.status).toBe(400);
  });

  it('(ul-4) partial credentials: password not present', async () => {
    const res = await request.post('/login').send({
      username: users[0].credentials.username.to_string(),
    });

    expect(res.status).toBe(400);
  });
});
