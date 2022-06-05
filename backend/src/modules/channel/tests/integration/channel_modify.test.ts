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

//set requester to not president
describe('modify channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[1].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ CM-1 ------------------------

  it('(cm-1) requester not a president', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'TechAtNest',
      description: 'Un club per STEMs'
    });

    expect(res.status).toBe(403);
  });
});

//set requester as president
describe('modify channel', () => {
  beforeAll(async () => {
    driver = await init_driver();
    clear_db(driver);
    const res = await populate_db(driver);
    channels = res.channels;
    users = res.users;

    const emitter = new EventEmitter();
    const app = await init_app(driver, emitter, res.users[4].id);
    request = supertest(app);
  });

  afterAll(async () => {
    await clear_db(driver);
    await close_driver(driver);
  });

  // ------------------------ CM-2 ------------------------

  it('(cm-2) non unique channel name', async () => {

    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: channels[0].name,
      description: 'Un club per nerd'
    });

    expect(res.status).toBe(409);
  });
  
  // ------------------------ CM-3 ------------------------

  it('(cm-3) invalid channel name: shorter than 5 characters', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'name',
      description: 'Un club per nerd'
    });

    expect(res.status).toBe(400);
  });

  it('(cm-3) invalid channel name: longer than 100 characters', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'a'.repeat(101),
      description: 'Un club per nerd'
    });

    expect(res.status).toBe(400);
  });

  it('(cm-3) invalid channel name: invalid characters', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'Is This Valid?',
      description: 'Un club per nerd',
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CM-4 ------------------------

  it('(cm-4) invalid channel description: shorter than 5 characters', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'NerdEST',
      description: 'Un c'
    });

    expect(res.status).toBe(400);
  });

  it('(cc-4) invalid channel description: longer than 300 characters', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'NerdEST',
      description: 'a'.repeat(301)
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CM-5 ------------------------

  it('(cm-5) channel description not specified', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'NerdEST'
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CM-6 ------------------------

  it('(cm-6) channel name not specified', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      description: 'Un club per nerd'
    });

    expect(res.status).toBe(400);
  });

  // ------------------------ CM-7 ------------------------

  it('(cm-7) Modify non-existing channel', async () => {
    const res = await request.patch(`/channels/0123456789`).send({
      name: 'NerdEST',
      description: 'Un club per nerd'
    });

    expect(res.status).toBe(404);
  });

  // ------------------------ CM-8 ------------------------

  it('(cm-8) successful channel modification', async () => {
    const res = await request.patch(`/channels/${channels[1].id!.to_string()}`).send({
      name: 'TechAtNest',
      description: 'Un club per STEMs'
    });

    expect(res.status).toBe(204);
  });
});