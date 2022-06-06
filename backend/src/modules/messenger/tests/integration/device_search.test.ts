//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('search your devices', () => {
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

  // --------------------- DS-1 ---------------------

  it('(ds-1) invalid offset: not a number', async () => {
    const res = await request.get('/users/me/devices?offset=abc');
    expect(res.status).toBe(400);
  });

  it('(ds-1) invalid offset: not an integer', async () => {
    const res = await request.get('/users/me/devices?offset=3.5');
    expect(res.status).toBe(400);
  });

  it('(ds-1) invalid offset: less than 0', async () => {
    const res = await request.get('/users/me/devices?offset=-2');
    expect(res.status).toBe(400);
  });

  // --------------------- ds-2 ---------------------

  it('(ds-2) invalid limit: not a number', async () => {
    const res = await request.get('/users/me/devices?limit=abc');
    expect(res.status).toBe(400);
  });

  it('(ds-2) invalid limit: not an integer', async () => {
    const res = await request.get('/users/me/devices?limit=3.5');
    expect(res.status).toBe(400);
  });

  it('(ds-2) invalid limit: less than 1', async () => {
    const res = await request.get('/users/me/devices?limit=-1');
    expect(res.status).toBe(400);
  });

  it('(ds-2) invalid limit: greater than 40', async () => {
    const res = await request.get('/users/me/devices?limit=100');
    expect(res.status).toBe(400);
  });

  // --------------------- ds-3 ---------------------

  it('(ds-3) successful search: not constraints', async () => {
    const res = await request.get('/users/me/devices');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/users/me/devices/${users[0].devices[0].id!.to_string()}`,
        name: users[0].devices[0].name,
        token: users[0].devices[0].token.to_string(),
        fingerprint: users[0].devices[0].fingerprint?.to_string(),
        timestamp: users[0].devices[0].timestamp.toISO(),
      },
      {
        self: `/users/me/devices/${users[0].devices[1].id!.to_string()}`,
        name: users[0].devices[1].name,
        token: users[0].devices[1].token.to_string(),
        fingerprint: users[0].devices[1].fingerprint?.to_string(),
        timestamp: users[0].devices[1].timestamp.toISO(),
      },
    ]);
  });

  it('(ds-3) successful search: limit constraint', async () => {
    const res = await request.get('/users/me/devices?limit=1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/users/me/devices/${users[0].devices[0].id!.to_string()}`,
        name: users[0].devices[0].name,
        token: users[0].devices[0].token.to_string(),
        fingerprint: users[0].devices[0].fingerprint?.to_string(),
        timestamp: users[0].devices[0].timestamp.toISO(),
      },
    ]);
  });

  it('(ds-3) successful search: offset constraint', async () => {
    const res = await request.get('/users/me/devices?offset=1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        self: `/users/me/devices/${users[0].devices[1].id!.to_string()}`,
        name: users[0].devices[1].name,
        token: users[0].devices[1].token.to_string(),
        fingerprint: users[0].devices[1].fingerprint?.to_string(),
        timestamp: users[0].devices[1].timestamp.toISO(),
      },
    ]);
  });

  it('(ds-3) successful search: limit and offset constraint', async () => {
    const res = await request.get('/users/me/devices?offset=2&limit=1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // --------------------- ds-4 ---------------------

  it('(ds-4) non existing email', async () => {
    const res = await request.get('/users/me/devices/00000000000');
    expect(res.status).toBe(404);
  });

  // --------------------- ds-5 ---------------------

  it('(ds-5) existing email', async () => {
    const res = await request.get(
      `/users/me/devices/${users[0].devices[1].id!.to_string()}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      self: `/users/me/devices/${users[0].devices[1].id!.to_string()}`,
      name: users[0].devices[1].name,
      token: users[0].devices[1].token.to_string(),
      fingerprint: users[0].devices[1].fingerprint?.to_string(),
      timestamp: users[0].devices[1].timestamp.toISO(),
    });
  });
});
