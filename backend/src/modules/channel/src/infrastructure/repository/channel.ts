//
//
//

import { UserID, UserRole } from '@nextapp/common/user';
import { InternalServerError } from '@nextapp/common/error';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { ChannelID, Channel } from '../../domain/models/channel';
import { User } from '../../domain/models/user';
import { ChannelRepository } from '../../domain/ports/channel.repository';

export class Neo4jRoomRepository implements ChannelRepository {
  private constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jRoomRepository> {
    let session = driver.session();
    try {
      // unique constraint on ID
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT CHANNEL_unique_channel_id IF NOT EXISTS
           FOR (c:CHANNEL_Channel)
           REQUIRE c.id IS UNIQUE`
        )
      );

      await session.close();
      session = driver.session();

      // unique constraint on name
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT CHANNEL_unique_channel_name IF NOT EXISTS
           FOR (c:CHANNEL_Channel)
           REQUIRE c.name IS UNIQUE`
        )
      );

      return new Neo4jRoomRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_channel(channel_id: ChannelID): Promise<Channel | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:CHANNEL_User)-[p:CHANNEL_PRESIDENT]->(c:CHANNEL_Channel { id: $id })
           RETURN u, c`,
          { id: channel_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const { id, name, description } =
        res.records[0].get('c').properties;

      const presidents: User[] = res.records.map((record) => {
          const { id, role } = record.get('u').properties;
          return {
              id: new UserID(id),
              role: role ? UserRole.SYS_ADMIN : UserRole.SIMPLE
          }
      });

      return new Channel(
        name,
        description, // since description is a string you do not need to stringify and parse it
        presidents,
        ChannelID.from_string(id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////// TODO: implement CHANNEL ---- PRESIDENTS connections ///////////////////// 
  ///////////////////////////////////////////////////////////////////////////////////////////////

  public async create_channel(channel: Channel): Promise<ChannelID | undefined> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = ChannelID.generate();
        const { name } = channel;
        const description =
          channel.description === undefined || channel.description === null
            ? null
            : JSON.stringify(channel.description);
        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `CREATE (c:CHANNEL_Channel {
               id: $id, 
               name: $name,
               description: $description,
            })`,
              { id: id.to_string(), name, description }
            )
          );
          return id;
        } catch (e) {
          const error = e as Neo4jError;
          if (
            error.code !== 'Neo.ClientError.Schema.ConstraintValidationFailed'
          ) {
            throw e;
          }
          // there is already a room with the same name
          if (error.message.includes(name)) {
            return undefined;
          }
        }
      }
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

}