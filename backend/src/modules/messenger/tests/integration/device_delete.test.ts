//
//
//

import { Driver } from 'neo4j-driver';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { init_app } from './init_app';
import { clear_db, close_driver, init_driver, populate_db } from './init_db';
import { User } from './util';

describe('delete your devices', () => {
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

  it('(dd-1) non existing device', async () => {
    const res = await request.delete('/users/me/devices/cdefghijklm');
    expect(res.status).toBe(404);
  });

  // --------------------- ED-2 ---------------------

  it('(dd-2) invalid device id', async () => {
    const res = await request.delete('/users/me/devices/abcd');
    expect(res.status).toBe(404);
  });

  // --------------------- ED-3 ---------------------

  it('(dd-3) successful delete', async () => {
    const res = await request.delete(
      `/users/me/emails/${users[0].devices[1].id!.to_string()}`
    );
    expect(res.status).toBe(204);
  });
});
