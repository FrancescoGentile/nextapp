/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
//
//
//

import neo4j, { Driver } from 'neo4j-driver';
import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { IdentityInfo, User } from '../../src/domain/models/user';
import { Password, Username } from '../../src/domain/models/credentials';

async function populate_users(driver: Driver): Promise<User[]> {
  const users: User[] = [
    {
      id: new UserID('1111111111'),
      role: UserRole.SYS_ADMIN,
      identity: new IdentityInfo('Francesco', undefined, 'Gentile'),
      credentials: {
        username: Username.from_string('francesco_gentile'),
        password: await Password.from_clear(
          'ReallyComplicatedPassword',
          Username.from_string('francesco_gentile')
        ),
      },
    },
    {
      id: new UserID('2222222222'),
      role: UserRole.SIMPLE,
      identity: new IdentityInfo('Manuela', undefined, 'Corte Pause'),
      credentials: {
        username: Username.from_string('manuela_cortepause'),
        password: await Password.from_clear(
          'ReallyComplicatedPassword',
          Username.from_string('manuela_cortepause')
        ),
      },
    },
  ];

  for (const user of users) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE (u:USER_User {
            id: $id,
            admin: $admin,
            username: $username,
            password: $password,
            first_name: $first_name,
            middle_name: $middle_name,
            surname: $surname
          })`,
          {
            id: user.id!.to_string(),
            admin: user.role === UserRole.SYS_ADMIN,
            username: user.credentials.username.to_string(),
            password: user.credentials.password.to_string(),
            first_name: user.identity.first_name,
            middle_name: user.identity.middle_name || null,
            surname: user.identity.surname,
          }
        )
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return users;
}

export async function populate_db(driver: Driver): Promise<User[]> {
  return populate_users(driver);
}

async function clear_users(driver: Driver) {
  const session = driver.session();
  try {
    await session.writeTransaction((tx) =>
      tx.run(
        `MATCH (u:USER_User) 
         DETACH DELETE u`
      )
    );
  } catch {
    throw new InternalServerError();
  } finally {
    await session.close();
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
