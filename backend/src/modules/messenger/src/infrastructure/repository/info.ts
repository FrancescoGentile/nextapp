//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import {
  Driver,
  Neo4jError,
  DateTime as NeoDateTime,
  Integer,
  int,
} from 'neo4j-driver';
import { DateTime } from 'luxon';
import {
  FCMToken,
  WebDevice,
  WebDeviceFingerprint,
  WebDeviceID,
} from '../../domain/models/device';
import { Email, EmailID } from '../../domain/models/email';
import { SearchOptions } from '../../domain/models/search';
import { InfoRepository } from '../../domain/ports/info.repository';

function luxon_to_neo4j(dt: DateTime): NeoDateTime {
  return new NeoDateTime<Integer>(
    int(dt.year),
    int(dt.month),
    int(dt.day),
    int(dt.hour),
    int(dt.minute),
    int(dt.second),
    int(0),
    int(dt.offset)
  );
}

function neo4j_to_luxon(dt: NeoDateTime): DateTime {
  return DateTime.fromISO(dt.toString());
}

export class Neo4jInfoRepository implements InfoRepository {
  private constructor(private readonly driver: Driver) {}

  // TODO: decide which indexes create
  public static async create(driver: Driver): Promise<Neo4jInfoRepository> {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT MESSENGER_unique_user_id IF NOT EXISTS
           FOR (u:MESSENGER_User)
           REQUIRE u.id IS UNIQUE`
        )
      );

      return new Neo4jInfoRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_user(user_id: UserID, email: Email): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE (u:MESSENGER_User { id: $user_id })-[t:MESSENGER_MEDIUM]->(e:MESSENGER_Email { id: $email_id, main: $main, email: $email })`,
          {
            user_id: user_id.to_string(),
            email_id: EmailID.generate().to_string(),
            main: email.main,
            email: email.to_string(),
          }
        )
      );

      return true;
    } catch (e) {
      const error = e as Neo4jError;
      if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
        return false;
      }
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_user(user_id: UserID): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH path = (:MESSENGER_User { id: $id })-[:MESSENGER_MEDIUM]->()
           DETACH DELETE path`,
          { id: user_id.to_string() }
        )
      );

      return res.summary.counters.updates().nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  // --------------------------- EMAILS ---------------------------

  public async check_email_by_name(
    user_id: UserID,
    email: Email
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email { email: $email })
           RETURN e`,
          { id: user_id.to_string(), email: email.to_string() }
        )
      );

      return res.records.length > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async change_email_main(user_id: UserID): Promise<void> {
    const session = this.driver.session();
    try {
      await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email { main: true })
           SET e.main = false`,
          { id: user_id.to_string() }
        )
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_email(
    user_id: UserID,
    email_id: EmailID
  ): Promise<Email | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           WHERE u.id = $user_id AND e.id = $email_id
           RETURN e`,
          { user_id: user_id.to_string(), email_id: email_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const { email, main } = res.records[0].get('e').properties;
      return Email.from_string(email, main, email_id);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_emails(
    user_id: UserID,
    options: SearchOptions
  ): Promise<Email[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           RETURN e
           ORDER BY e.name
           SKIP $skip
           LIMIT $limit`,
          {
            id: user_id.to_string(),
            skip: options.offset,
            limit: options.limit,
          }
        )
      );

      const emails = res.records.map((record) => {
        const { id, main, email } = record.get('e').properties;
        return Email.from_string(email, main, EmailID.from_string(id));
      });

      return emails;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async add_email(
    user_id: UserID,
    email: Email
  ): Promise<EmailID | undefined> {
    const session = this.driver.session();
    try {
      let id: EmailID;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        id = EmailID.generate();
        // eslint-disable-next-line no-await-in-loop
        const e = await this.get_email(user_id, id);
        if (e === null) {
          break;
        }
      }

      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $user_id })
           CREATE (u)-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email { id: $email_id, main: $main, email: $email })`,
          {
            user_id: user_id.to_string(),
            email_id: id.to_string(),
            main: email.main,
            email: email.to_string(),
          }
        )
      );

      return res.summary.counters.updates().nodesCreated > 0 ? id : undefined;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_email(
    user_id: UserID,
    email_id: EmailID
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           WHERE u.id = $user_id AND e.id = $email_id
           DETACH DELETE e`,
          { user_id: user_id.to_string(), email_id: email_id.to_string() }
        )
      );

      return res.summary.counters.updates().nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  // --------------------------------------------------------------

  public async check_device_by_token(
    user_id: UserID,
    token: FCMToken
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice)
           WHERE u.id = $id AND w.token = $token
           RETURN w.id`,
          { id: user_id.to_string(), token: token.to_string() }
        )
      );
      return res.records.length > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  private async get_device(
    user_id: UserID,
    device_id: WebDeviceID
  ): Promise<WebDevice | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice)
           WHERE u.id = $user_id AND w.id = $device_id
           RETURN w`,
          { user_id: user_id.to_string(), device_id: device_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const { id, fingerprint, token, name, timestamp } =
        res.records[0].get('w').properties;

      return {
        id: WebDeviceID.from_string(id),
        fingerprint:
          fingerprint !== undefined
            ? new WebDeviceFingerprint(fingerprint)
            : undefined,
        token: new FCMToken(token),
        name,
        timestamp: neo4j_to_luxon(timestamp),
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async add_device(
    user_id: UserID,
    device: WebDevice
  ): Promise<WebDeviceID | undefined> {
    const session = this.driver.session();
    try {
      let id: WebDeviceID;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        id = WebDeviceID.generate();
        // eslint-disable-next-line no-await-in-loop
        const e = await this.get_device(user_id, id);
        if (e === null) {
          break;
        }
      }

      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $user_id })
           CREATE (u)->[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice {
             id: $id,
             fingerprint: $fingerprint,
             token: $token,
             name: $name, 
             timestamp: $timestamp
           })`,
          {
            user_id: user_id.to_string(),
            id,
            fingerprint: device.fingerprint?.to_string() || null,
            token: device.token.to_string(),
            name: device.name,
            timestamp: luxon_to_neo4j(device.timestamp),
          }
        )
      );

      return res.summary.counters.updates().nodesCreated > 0 ? id : undefined;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async delete_device(
    user_id: UserID,
    device_id: WebDeviceID
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice)
           WHERE u.id = $user_id AND w.id = $device_id
           DETACH DELETE w`,
          { user_id: user_id.to_string(), device_id: device_id.to_string() }
        )
      );

      return res.summary.counters.updates().nodesDeleted > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
}
