/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
//
//
//

import neo4j, { Driver } from 'neo4j-driver';
import { DateTime as NeoDateTime, Integer, int } from 'neo4j-driver-core';
import { UserID } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { DateTime } from 'luxon';
import { User } from './util';
import { EmailAddress, EmailID } from '../../src/domain/models/email';
import {
  WebDeviceFingerprint,
  WebDeviceID,
} from '../../src/domain/models/device';
import { NotificationToken } from '../../src/domain/models/notification';

const users: User[] = [
  {
    id: new UserID('1111111111'),
    emails: [
      EmailAddress.from_string(
        'manuela.cortepause@studenti.unitn.it',
        true,
        EmailID.from_string('abcdefghijk')
      ),
      EmailAddress.from_string(
        'manuela.cortepause@unitn.it',
        false,
        EmailID.from_string('bcdefghijkl')
      ),
    ],
    devices: [
      {
        id: WebDeviceID.from_string('abcdefghijk'),
        token: new NotificationToken('registrationtoken1'),
        name: 'Device1',
        timestamp: DateTime.utc().startOf('second'),
      },
      {
        id: WebDeviceID.from_string('bcdefghijkl'),
        token: new NotificationToken('registrationtoken2'),
        name: 'Device2',
        timestamp: DateTime.utc().plus({ minutes: 5 }).startOf('second'),
        fingerprint: new WebDeviceFingerprint('fingerprint2'),
      },
    ],
  },
];

function luxon_to_neo4j(dt: DateTime): NeoDateTime {
  return new NeoDateTime<Integer>(
    int(dt.year),
    int(dt.month),
    int(dt.day),
    int(dt.hour),
    int(dt.minute),
    int(dt.second),
    int(dt.millisecond),
    int(dt.offset)
  );
}

async function populate_users(driver: Driver): Promise<User[]> {
  for (const user of users) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(`CREATE (u:MESSENGER_User {id: $id })`, {
          id: user.id.to_string(),
        })
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return users;
}

async function populate_emails(driver: Driver) {
  for (const user of users) {
    for (const email of user.emails) {
      const session = driver.session();
      try {
        await session.writeTransaction((tx) =>
          tx.run(
            `MATCH (u:MESSENGER_User {id: $id })
             CREATE (u)-[:MESSENGER_MEDIUM]->(e:MESSENGER_Email {
                id: $email_id,
                main: $main,
                email: $email
             })`,
            {
              id: user.id.to_string(),
              email_id: email.id!.to_string(),
              main: email.main,
              email: email.to_string(),
            }
          )
        );
      } catch {
        throw new InternalServerError();
      } finally {
        await session.close();
      }
    }
  }
}

export async function populate_devices(driver: Driver) {
  for (const user of users) {
    for (const device of user.devices) {
      const session = driver.session();
      try {
        await session.writeTransaction((tx) =>
          tx.run(
            `MATCH (u:MESSENGER_User { id: $user_id })
             CREATE (u)-[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice {
               id: $id,
               fingerprint: $fingerprint,
               token: $token,
               name: $name, 
               timestamp: $timestamp
             })`,
            {
              user_id: user.id.to_string(),
              id: device.id!.to_string(),
              fingerprint: device.fingerprint?.to_string() || null,
              token: device.token.to_string(),
              name: device.name,
              timestamp: luxon_to_neo4j(device.timestamp),
            }
          )
        );
      } catch {
        throw new InternalServerError();
      } finally {
        await session.close();
      }
    }
  }
}

export async function populate_db(driver: Driver): Promise<User[]> {
  await populate_users(driver);
  await populate_emails(driver);
  await populate_devices(driver);

  return users;
}

async function clear_users(driver: Driver) {
  for (const user of users) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `MATCH path = (:MESSENGER_User { id: $id })-[:MESSENGER_MEDIUM]->()
           DETACH DELETE path`,
          { id: user.id.to_string() }
        )
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
}

export async function clear_db(driver: Driver) {
  await clear_users(driver);
}

export async function init_driver(): Promise<Driver> {
  const url = process.env.NEO4J_URL;
  const username = process.env.NEO4J_USERNAME;
  const pwd = process.env.NEO4J_PWD;
  if (url === undefined || username === undefined || pwd === undefined) {
    throw new InternalServerError('Missing Neo4J parameters.');
  }

  const driver = neo4j.driver(url, neo4j.auth.basic(username, pwd));
  try {
    await driver.verifyConnectivity();
  } catch {
    throw new InternalServerError('It was not possible to connect to Neo4J.');
  }

  return driver;
}

export async function close_driver(driver: Driver) {
  await driver.close();
}
