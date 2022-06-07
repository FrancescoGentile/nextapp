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

describe('change role', () => {
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

  // ------------------------ UCR-1 ------------------------

  it('(ucr-1) successful change of user role', async () => {
    const res = await request
      .patch(`/users/${users[1].id!.to_string()}`)
      .set('Cookie', `jwt=${admin_token}`)
      .send({ is_admin: true });

    expect(res.status).toBe(204);
  });

  // ------------------------ UCR-2 ------------------------

  it('(ucr-2) attempt to change role made by simple user', async () => {
    const res = await request
      .patch(`/users/${users[1].id!.to_string()}`)
      .set('Cookie', `jwt=${simple_token}`)
      .send({ is_admin: true });

    expect(res.status).toBe(403);
  });

  // ------------------------ UCR-3 ------------------------

  it('(ucr-3) non existing user', async () => {
    const res = await request
      .patch(`/users/0000000000`)
      .set('Cookie', `jwt=${admin_token}`)
      .send({ is_admin: true });

    expect(res.status).toBe(404);
  });

  it('(ucr-3) invalid user id', async () => {
    const res = await request
      .patch(`/users/abcde`)
      .set('Cookie', `jwt=${admin_token}`)
      .send({ is_admin: true });

    expect(res.status).toBe(404);
  });

  // ------------------------ UCR-4 ------------------------

  it('(ucr-4) missing new role', async () => {
    const res = await request
      .patch(`/users/${users[1].id!.to_string()}`)
      .set('Cookie', `jwt=${admin_token}`)
      .send();

    expect(res.status).toBe(400);
  });
});

let token: string;

describe('change password', () => {
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

  // ------------------------ UCP-1 ------------------------

  it('(ucp-1) successful change of password', async () => {
    const res = await request
      .patch(`/users/me/password`)
      .set('Cookie', `jwt=${token}`)
      .send({
        old_password: 'ReallyComplicatedPassword',
        new_password: 'ExtremelyComplicatedPassword',
      });

    expect(res.status).toBe(204);
  });

  // ------------------------ UCP-2 ------------------------

  it('(ucp-2) wrong current password', async () => {
    const res = await request
      .patch(`/users/me/password`)
      .set('Cookie', `jwt=${token}`)
      .send({
        old_password: 'WrongPassword',
        new_password: 'ExtremelyComplicatedPassword',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UCP-3 ------------------------

  it('(ucp-3) simple new password', async () => {
    const res = await request
      .patch(`/users/me/password`)
      .set('Cookie', `jwt=${token}`)
      .send({
        old_password: 'WrongPassword',
        new_password: 'Manuela',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UCP-4 ------------------------

  it('(ucp-4) missing old password', async () => {
    const res = await request
      .patch(`/users/me/password`)
      .set('Cookie', `jwt=${token}`)
      .send({
        new_password: 'ExtremelyComplicatedPassword',
      });

    expect(res.status).toBe(400);
  });

  it('(ucp-4) missing new password', async () => {
    const res = await request
      .patch(`/users/me/password`)
      .set('Cookie', `jwt=${token}`)
      .send({
        old_password: 'ReallyComplicatedPassword',
      });

    expect(res.status).toBe(400);
  });

  it('(ucp-4) missing information', async () => {
    const res = await request
      .patch(`/users/me/password`)
      .set('Cookie', `jwt=${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('reset password', () => {
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

  // ------------------------ RP-1 ------------------------

  it('(rp-1) missing username', async () => {
    const res = await request.post('/forgot-password').send({});

    expect(res.status).toBe(400);
  });

  // ------------------------ RP-2 ------------------------

  it('(rp-2) invalid username', async () => {
    const res = await request.post('/forgot-password').send({
      username: 'ciao',
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RP-3 ------------------------

  it('(rp-3) non existing username', async () => {
    const res = await request.post('/forgot-password').send({
      username: 'nonexistingusername',
    });

    expect(res.status).toBe(202);
  });

  // ------------------------ RP-4 ------------------------

  it('(rp-4) non username', async () => {
    const res = await request.post('/forgot-password').send({
      username: users[1].credentials.username.to_string(),
    });

    expect(res.status).toBe(202);
  });
});
