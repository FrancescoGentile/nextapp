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

describe('registration', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    users = await populate_db(driver);

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter);
    request = supertest(app);

    admin_token = await get_token(request, users[0]);
    simple_token = await get_token(request, users[1]);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ UR-1 ------------------------

  it('(ul-1) successful registration', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: 'riccardo_gennaro',
        password: 'ReallyComplicatedPassword',
        email: 'riccardo@example.com',
      });

    expect(res.status).toBe(201);
    expect(res.header.location).toBeDefined();
  });

  // ------------------------ UR-2 ------------------------

  it('(ur-2) simple user', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${simple_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: 'riccardo_gennaro',
        password: 'ReallyComplicatedPassword',
        email: 'riccardo@example.com',
      });

    expect(res.status).toBe(403);
  });

  // ------------------------ UR-3 ------------------------

  it('(ur-3) username already used', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo@example.com',
      });

    expect(res.status).toBe(409);
  });

  // ------------------------ UR-4 ------------------------

  it('(ur-4) simple password: common password', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: 'riccardo_gennaro',
        password: 'password',
        email: 'riccardo@example.com',
      });

    expect(res.status).toBe(400);
  });

  it('(ur-4) simple password: password similar to username', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: 'riccardo_gennaro',
        password: 'riccardo',
        email: 'riccardo@example.com',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UR-5 ------------------------

  it('(ur-5) invalid email', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UR-6 ------------------------

  it('(ur-6) invalid first name: empty value', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: '    ',
        surname: 'Gennaro',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UR-7 ------------------------

  it('(ur-6) invalid middle name: empty value', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        middle_name: ' ',
        surname: 'Gennaro',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UR-8 ------------------------

  it('(ur-8) invalid surname: empty value', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: '',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  // ------------------------ UR-9 ------------------------

  it('(ur-9) missing information: missing first name', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        surname: '',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  it('(ur-9) missing information: missing surname', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  it('(ur-9) missing information: missing role', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  it('(ur-9) missing information: missing username', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        password: 'ReallyComplicatedPassword',
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  it('(ur-9) missing information: missing password', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        email: 'riccardo.gmail.com',
      });

    expect(res.status).toBe(400);
  });

  it('(ur-9) missing information: missing email', async () => {
    const res = await request
      .post('/users')
      .set('Cookie', `jwt=${admin_token}`)
      .send({
        first_name: 'Riccardo',
        surname: 'Gennaro',
        is_admin: false,
        username: users[0].credentials.username.to_string(),
        password: 'ReallyComplicatedPassword',
      });

    expect(res.status).toBe(400);
  });
});
