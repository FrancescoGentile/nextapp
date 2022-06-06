//
//
//

import EventEmitter from 'eventemitter3';
import { Driver } from 'neo4j-driver';
import supertest from 'supertest';
import { Channel } from '../domain/models/channel';
import { User } from '../domain/models/user';
import { init_app } from './init_app';
import { init_driver, clear_db, close_driver, populate_db } from './init_db';

let driver: Driver;
let request: supertest.SuperTest<any>;

let channels: Channel[];
let users: User[];

//set requester to simple user
describe('create channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ CC-1 ------------------------

  it('(cc-1) simple user', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(403);
  });
});


//set requester to simple user sys-admins
describe('create channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[0].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ CC-2 ------------------------

  it('(cc-2) non unique channel name', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];

    const res = await request.post('/channels').send({
      name: channels[0].name,
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(409);
  });

  // ------------------------ CC-3 ------------------------

  it('(cc-4) channel name not specified', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ RC-4 ------------------------

  it('(cc-4) invalid channel name: shorter than 5 characters', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'name',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  it('(cc-4) invalid channel name: longer than 100 characters', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'a'.repeat(101),
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  it('(cc-4) invalid channel name: invalid characters', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'Is This Valid?',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CC-5 ------------------------

  it('(cc-5) channel description not specified', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CC-6 ------------------------

  it('(cc-6) invalid channel description: shorter than 5 characters', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un c',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  it('(cc-6) invalid channel description: longer than 300 characters', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'a'.repeat(301),
      presID_array
    });

    expect(res.status).toBe(400);
  });
  

  // ------------------------ CC-7 ------------------------

  it('(cc-7) presidents not specified', async () => {
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd'
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CC-8 ------------------------

  it('(cc-8) number of presidents more then 4', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
      users[2].id!.to_string(),
      users[3].id!.to_string(),
      users[4].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  it('(cc-8) number of presidents less then 1', async () => {
    const presID_array: string[] = [];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CC-9 ------------------------

  it('(cc-9) number of presidents more then 4', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
      users[2].id!.to_string(),
      users[3].id!.to_string(),
      users[4].id!.to_string(),
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CC-10 ------------------------

  it('(cc-10) president not a user', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string(),
      '0123456789'
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(404);
  });

  // ------------------------ CC-11 ------------------------

  it('(cc-11) channel successfully created', async () => {
    const presID_array: string[] = [
      users[0].id!.to_string(),
      users[1].id!.to_string()
    ];
    const res = await request.post('/channels').send({
      name: 'NerdEST',
      description: 'Un club per nerd',
      presID_array
    });

    expect(res.status).toBe(201);
  });

});
