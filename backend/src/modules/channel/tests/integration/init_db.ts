/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
//
//
//

import neo4j, { Driver } from 'neo4j-driver';
import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { User } from '../../src/domain/models/user';
import { Channel, ChannelID } from '../../src/domain/models/channel';
import { Sub, SubID } from '../../src/domain/models/sub';
import { pid } from 'process';

export async function populate_users(driver: Driver): Promise<User[]> {
  const users: User[] = [
    { id: new UserID('1111111111'), role: UserRole.SYS_ADMIN },
    { id: new UserID('2222222222'), role: UserRole.SIMPLE },
    { id: new UserID('3333333333'), role: UserRole.SIMPLE },
    { id: new UserID('4444444444'), role: UserRole.SIMPLE },
    { id: new UserID('5555555555'), role: UserRole.SIMPLE },
    { id: new UserID('6666666666'), role: UserRole.SIMPLE },
  ];

  for (const user of users) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(`CREATE (u:CHANNEL_User { id: $id, admin: $admin })`, {
          id: user.id.to_string(),
          admin: user.role === UserRole.SYS_ADMIN,
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

async function populate_channels(
  driver: Driver,
  users: User[]
): Promise<Channel[]> {
  const pres_array1: UserID[] = [users[0].id, users[1].id];
  const pres_array2: UserID[] = [users[5].id, users[4].id];
  const channels: Channel[] = [
    new Channel(
      'Channel1',
      'A really cool presentation',
      pres_array1,
      ChannelID.from_string('1111111111')
    ),
    new Channel(
      'Channel2',
      undefined,
      pres_array2,
      ChannelID.from_string('2222222222')
    ),
  ];

  for (const channel of channels) {
    let session = driver.session();
    const descr =
      channel.description === undefined || channel.description === null
        ? null
        : channel.description;
    try {
      // console.log(channel.id!.to_string() + ', ' + channel.name + ', ' + descr);
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE (c:CHANNEL_Channel {
          id: $id, 
          name: $name,
          description: $description })`,
          {
            id: channel.id!.to_string(),
            name: channel.name,
            description: descr,
          }
        )
      );
      await session.close();
      session = driver.session();
      for (const pres of channel.presID_array) {
        // console.log('POPULATING: u ' + pres.to_string() + ' --> c ' + channel.id!.to_string())
        await session.writeTransaction((tx) =>
          tx.run(
            `MATCH (u:CHANNEL_User), (c:CHANNEL_Channel)
            WHERE u.id = $user_id AND c.id = $channel_id
            CREATE (u)-[p:CHANNEL_PRESIDENT]->(c)`,
            {
              user_id: pres.to_string(),
              channel_id: channel.id!.to_string(),
            }
          )
        );
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return channels;
}

async function populate_subscriptions(
  driver: Driver,
  users: User[],
  channels: Channel[]
): Promise<Sub[]> {
  const subscriptions: Sub[] = [
    //subscribe users
    {
      id: SubID.from_string('2222200000'),
      user: users[2].id,
      channel: channels[0].id!,
    },
    {
      id: SubID.from_string('4444400000'),
      user: users[4].id,
      channel: channels[0].id!,
    },
    {
      id: SubID.from_string('3333311111'),
      user: users[3].id,
      channel: channels[1].id!,
    },
    // subscribe presidents
    {
      id: SubID.from_string('0000000000'),
      user: users[0].id,
      channel: channels[0].id!,
    },
    {
      id: SubID.from_string('1111100000'),
      user: users[1].id,
      channel: channels[0].id!,
    },
    {
      id: SubID.from_string('5555511111'),
      user: users[5].id,
      channel: channels[1].id!,
    },
    {
      id: SubID.from_string('4444411111'),
      user: users[4].id,
      channel: channels[1].id!,
    },
  ];
  // Subscribe every president
  for (const subscription of subscriptions) {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User), (c:CHANNEL_Channel)
            WHERE u.id = $user_id AND c.id = $channel_id
            CREATE (u)-[s:CHANNEL_SUB { id: $subscription_id }]->(c)`,
          {
            user_id: subscription.user.to_string(),
            channel_id: subscription.channel.to_string(),
            subscription_id: subscription.id!.to_string(),
          }
        )
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  return subscriptions;
}

export async function populate_db(driver: Driver): Promise<{
  users: User[];
  channels: Channel[];
  supscriptions: Sub[];
}> {
  const users = await populate_users(driver);
  const channels = await populate_channels(driver, users);
  const supscriptions = await populate_subscriptions(driver, users, channels);

  return { users, channels, supscriptions };
}

async function clear_users(driver: Driver) {
  const session = driver.session();
  try {
    await session.writeTransaction((tx) =>
      tx.run(
        `MATCH (u:CHANNEL_User) 
         DETACH DELETE u`
      )
    );
  } catch {
    throw new InternalServerError();
  } finally {
    await session.close();
  }
}

async function clear_channels(driver: Driver) {
  const session = driver.session();
  try {
    await session.writeTransaction((tx) =>
      tx.run(
        `MATCH (c: CHANNEL_Channel) 
         DETACH DELETE c`
      )
    );
  } catch {
    throw new InternalServerError();
  } finally {
    await session.close();
  }
}

export async function clear_db(driver: Driver) {
  await Promise.all([clear_users(driver), clear_channels(driver)]);
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
