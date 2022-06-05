//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('modify details about your emails', () => {
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

  // --------------------- EM-1 ---------------------

  it('(em-1) non existing email', async () => {
    const res = await request.patch('/users/me/emails/00000000000').send({
      main: true,
    });
    expect(res.status).toBe(404);
  });

  // --------------------- EM-2 ---------------------

  it('(em-2) invalid email id', async () => {
    const res = await request.patch('/users/me/emails/abcde').send({
      main: true,
    });

    expect(res.status).toBe(404);
  });

  // --------------------- EM-3 ---------------------

  it('(em-3) missing main field', async () => {
    const res = await request
      .patch(`/users/me/emails/${users[0].emails[1].id!.to_string()}`)
      .send({});

    expect(res.status).toBe(400);
  });

  // --------------------- EM-4 ---------------------

  it('(em-4) main field set to false', async () => {
    const res = await request
      .patch(`/users/me/emails/${users[0].emails[1].id!.to_string()}`)
      .send({
        main: false,
      });

    expect(res.status).toBe(400);
  });

  // --------------------- EM-5 ---------------------

  it('(em-5.1) successful set to main', async () => {
    const res = await request
      .patch(`/users/me/emails/${users[0].emails[1].id!.to_string()}`)
      .send({
        main: true,
      });

    expect(res.status).toBe(204);
  });

  it('(ec-5.2) successful set to main (already main email)', async () => {
    const res = await request
      .patch(`/users/me/emails/${users[0].emails[0].id!.to_string()}`)
      .send({
        main: true,
      });

    expect(res.status).toBe(204);
  });
});
