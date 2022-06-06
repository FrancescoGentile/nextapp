//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('add new emails', () => {
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

  // --------------------- EC-1 ---------------------

  it('(ec-1) invalid email', async () => {
    const res = await request.post('/users/me/emails').send({
      email: 'wrong.mail.com',
    });
    expect(res.status).toBe(400);
  });

  // --------------------- EC-2 ---------------------

  it('(ec-2) missing email field', async () => {
    const res = await request.post('/users/me/emails').send({});

    expect(res.status).toBe(400);
  });

  // --------------------- EC-3 ---------------------

  it('(ec-3) invalid main field', async () => {
    const res = await request.post('/users/me/emails').send({
      email: 'example@gmail.com',
      main: 'hello',
    });

    expect(res.status).toBe(400);
  });

  // --------------------- EC-4 ---------------------

  it('(ec-4) trying to add an already added email', async () => {
    const res = await request.post('/users/me/emails').send({
      email: 'manuela.cortepause@unitn.it',
    });
    expect(res.status).toBe(409);
  });

  // --------------------- EC-5 ---------------------

  it('(ec-5.1) successful addition of a new non-main email', async () => {
    const res = await request.post('/users/me/emails').send({
      email: 'example@gmail.com',
    });
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(
      /^\/users\/me\/emails\/[0-9a-zA-Z_-]{11}$/
    );
  });

  it('(ec-5.2) successful addition of a new non-main email', async () => {
    const res = await request.post('/users/me/emails').send({
      email: 'anotherone@gmail.com',
      main: false,
    });
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(
      /^\/users\/me\/emails\/[0-9a-zA-Z_-]{11}$/
    );
  });

  // --------------------- EC-5 ---------------------

  it('(ec-5.2) successful addition of a new main email', async () => {
    const res = await request.post('/users/me/emails').send({
      email: 'main@gmail.com',
      main: true,
    });
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(
      /^\/users\/me\/emails\/[0-9a-zA-Z_-]{11}$/
    );
  });
});
