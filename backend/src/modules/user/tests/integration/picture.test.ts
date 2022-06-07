/* eslint-disable no-console */
//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';
import { get_token } from './util';

let driver: Driver;
let request: supertest.SuperTest<any>;

let simple_token: string;

describe('user picture', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);

    simple_token = await get_token(request, users[1]);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ---------------------

  it('(rp-1) get non existing picture', async () => {
    const res = await request
      .get('/users/me/picture')
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(404);
  });

  it('(lp-1) load picture', async () => {
    const res = await request
      .put('/users/me/picture')
      .set('Cookie', `jwt=${simple_token}`)
      .attach('picture', 'picture.jpg');

    expect(res.status).toBe(204);
  });

  it('(rp-2) get existing picture', async () => {
    const res = await request
      .get('/users/me/picture')
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
  });

  it('(rp-1) remove existing picture', async () => {
    const res = await request
      .delete('/users/me/picture')
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(204);
  });

  it('(rp-2) remove non existing picture', async () => {
    const res = await request
      .delete('/users/me/picture')
      .set('Cookie', `jwt=${simple_token}`);

    expect(res.status).toBe(404);
  });
});
