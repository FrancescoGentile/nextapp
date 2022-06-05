//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('search your emails', () => {
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

  // --------------------- ES-1 ---------------------

  it('(es-1) invalid offset: not a number', async () => {
    const res = await request.get('/users/me/emails?offset=abc');
    expect(res.status).toBe(400);
  });

  it('(es-1) invalid offset: not an integer', async () => {
    const res = await request.get('/users/me/emails?offset=3.5');
    expect(res.status).toBe(400);
  });

  it('(es-1) invalid offset: less than 0', async () => {
    const res = await request.get('/users/me/emails?offset=-2');
    expect(res.status).toBe(400);
  });

  // --------------------- ES-2 ---------------------

  it('(es-2) invalid limit: not a number', async () => {
    const res = await request.get('/users/me/emails?limit=abc');
    expect(res.status).toBe(400);
  });

  it('(es-2) invalid limit: not an integer', async () => {
    const res = await request.get('/users/me/emails?limit=3.5');
    expect(res.status).toBe(400);
  });

  it('(es-2) invalid limit: less than 1', async () => {
    const res = await request.get('/users/me/emails?limit=-1');
    expect(res.status).toBe(400);
  });

  it('(es-2) invalid limit: greater than 40', async () => {
    const res = await request.get('/users/me/emails?limit=100');
    expect(res.status).toBe(400);
  });

  // --------------------- ES-3 ---------------------

  it('(es-3) successful search: not constraints', async () => {
    const res = await request.get('/users/me/emails');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      {
        self: `/users/me/emails/${users[0].emails[0].id!.to_string()}`,
        main: users[0].emails[0].main,
        email: users[0].emails[0].to_string(),
      },
      {
        self: `/users/me/emails/${users[0].emails[1].id!.to_string()}`,
        main: users[0].emails[1].main,
        email: users[0].emails[1].to_string(),
      },
    ]);
  });

  it('(es-3) successful search: limit constraint', async () => {
    const res = await request.get('/users/me/emails?limit=1');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      {
        self: `/users/me/emails/${users[0].emails[0].id!.to_string()}`,
        main: users[0].emails[0].main,
        email: users[0].emails[0].to_string(),
      },
    ]);
  });

  it('(es-3) successful search: offset constraint', async () => {
    const res = await request.get('/users/me/emails?offset=1');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      {
        self: `/users/me/emails/${users[0].emails[1].id!.to_string()}`,
        main: users[0].emails[1].main,
        email: users[0].emails[1].to_string(),
      },
    ]);
  });

  it('(es-3) successful search: limit and offset constraint', async () => {
    const res = await request.get('/users/me/emails?offset=2&limit=1');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  // --------------------- ES-4 ---------------------

  it('(es-4) non existing email', async () => {
    const res = await request.get('/users/me/emails/00000000000');
    expect(res.status).toBe(404);
  });

  // --------------------- ES-5 ---------------------

  it('(es-5) existing email', async () => {
    const res = await request.get(
      `/users/me/emails/${users[0].emails[0].id!.to_string()}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      self: `/users/me/emails/${users[0].emails[0].id!.to_string()}`,
      main: users[0].emails[0].main,
      email: users[0].emails[0].to_string(),
    });
  });
});
