//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('delete your emails', () => {
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

  // --------------------- ED-1 ---------------------

  it('(ed-1) non existing email', async () => {
    const res = await request.delete('/users/me/emails/cdefghijklm');
    expect(res.status).toBe(404);
  });

  // --------------------- ED-2 ---------------------

  it('(ed-2) invalid email id', async () => {
    const res = await request.delete('/users/me/emails/abcd');
    expect(res.status).toBe(404);
  });

  // --------------------- ED-3 ---------------------

  it('(ed-3) deleting main email', async () => {
    const res = await request.delete(
      `/users/me/emails/${users[0].emails[0].id!.to_string()}`
    );
    expect(res.status).toBe(409);
  });

  // --------------------- ED-4 ---------------------

  it('(ed-4) successful delete', async () => {
    const res = await request.delete(
      `/users/me/emails/${users[0].emails[1].id!.to_string()}`
    );
    expect(res.status).toBe(204);
  });
});
