/* eslint-disable import/extensions */
/* eslint-disable no-console */
//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { Booking } from '../../src/domain/models/booking';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let bookings: Booking[];

describe('delete booking', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    bookings = res.bookings;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[0].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ BD-1 ------------------------

  it('(bd-1) non existing booking', async () => {
    const res = await request.delete(
      `/users/me/bookings/${bookings[1].id!.to_string()}`
    );
    expect(res.status).toBe(404);
  });

  // ------------------------ BD-2 ------------------------

  it('(bd-2) successful delete', async () => {
    const res = await request.delete(
      `/users/me/bookings/${bookings[0].id!.to_string()}`
    );
    expect(res.status).toBe(204);
  });
});
