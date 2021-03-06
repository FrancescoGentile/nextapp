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
} from 'neo4j-driver-core';
import { DateTime } from 'luxon';
import {
  WebDevice,
  WebDeviceFingerprint,
  WebDeviceID,
} from '../../domain/models/device';
import { NotificationToken } from '../../domain/models/notification';
import { EmailAddress, EmailID } from '../../domain/models/email';
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
    int(dt.millisecond),
    int(dt.offset)
  );
}

function neo4j_to_luxon(dt: NeoDateTime): DateTime {
  return DateTime.fromISO(dt.toString()).toUTC();
}

export class Neo4jInfoRepository implements InfoRepository {
  private constructor(private readonly driver: Driver) {}

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

      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT MESSENGER_unique_email_id IF NOT EXISTS
           FOR (e:MESSENGER_Email)
           REQUIRE e.id IS UNIQUE`
        )
      );

      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT MESSENGER_unique_webdevice_id IF NOT EXISTS
           FOR (w:MESSENGER_webDevive)
           REQUIRE w.id IS UNIQUE`
        )
      );

      return new Neo4jInfoRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async create_user(
    user_id: UserID,
    email: EmailAddress
  ): Promise<boolean> {
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
    email: EmailAddress
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

  public async unset_email_main(user_id: UserID): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email { main: true })
           SET e.main = false`,
          { id: user_id.to_string() }
        )
      );

      return res.summary.counters.updates().propertiesSet > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async set_email_main(
    user_id: UserID,
    email_id: EmailID
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           WHERE u.id = $user_id AND e.id = $email_id
           SET e.main = true`,
          { user_id: user_id.to_string(), email_id: email_id.to_string() }
        )
      );

      return res.summary.counters.updates().propertiesSet > 0;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_email(
    user_id: UserID,
    email_id: EmailID
  ): Promise<EmailAddress | null> {
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
      return EmailAddress.from_string(email, main, email_id);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_emails(
    user_id: UserID,
    options: SearchOptions
  ): Promise<EmailAddress[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           RETURN e
           ORDER BY e.email
           SKIP $skip
           LIMIT $limit`,
          {
            id: user_id.to_string(),
            skip: int(options.offset),
            limit: int(options.limit),
          }
        )
      );

      const emails = res.records.map((record) => {
        const { id, main, email } = record.get('e').properties;
        return EmailAddress.from_string(email, main, EmailID.from_string(id));
      });

      return emails;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_users_emails(user_ids: UserID[]): Promise<EmailAddress[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           WHERE u.id IN $ids
           RETURN e`,
          { ids: user_ids.map((id) => id.to_string()) }
        )
      );

      const emails = res.records.map((record) => {
        const { id, main, email } = record.get('e').properties;
        return EmailAddress.from_string(email, main, EmailID.from_string(id));
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
    email: EmailAddress
  ): Promise<EmailID> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = EmailID.generate();

        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
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
          return id;
        } catch (e) {
          const error = e as Neo4jError;
          if (
            error.code !== 'Neo.ClientError.Schema.ConstraintValidationFailed'
          ) {
            throw e;
          }
        }
      }
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
    token: NotificationToken
  ): Promise<WebDeviceID | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice)
           WHERE u.id = $id AND w.token = $token
           RETURN w.id AS id`,
          { id: user_id.to_string(), token: token.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const id = res.records[0].get('id');
      return WebDeviceID.from_string(id);
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_notification_tokens(
    user_ids: UserID[]
  ): Promise<NotificationToken[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User)-[:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice)
           WHERE u.id in $ids
           RETURN w.token as token`,
          { ids: user_ids.map((id) => id.to_string()) }
        )
      );

      const tokens = res.records.map(
        (record) => new NotificationToken(record.get('token'))
      );

      return tokens;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_device(
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
        token: new NotificationToken(token),
        name,
        timestamp: neo4j_to_luxon(timestamp),
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_devices(
    user_id: UserID,
    options: SearchOptions
  ): Promise<WebDevice[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(w:MESSENGER_WebDevice)
           RETURN w
           ORDER BY w.timestamp
           SKIP $skip
           LIMIT $limit`,
          {
            id: user_id.to_string(),
            skip: int(options.offset),
            limit: int(options.limit),
          }
        )
      );

      const devices = res.records.map((record) => {
        const { id, fingerprint, token, name, timestamp } =
          record.get('w').properties;

        return {
          id: WebDeviceID.from_string(id),
          fingerprint:
            fingerprint !== undefined
              ? new WebDeviceFingerprint(fingerprint)
              : undefined,
          token: new NotificationToken(token),
          name,
          timestamp: neo4j_to_luxon(timestamp),
        };
      });

      return devices;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async add_device(
    user_id: UserID,
    device: WebDevice
  ): Promise<WebDeviceID> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = WebDeviceID.generate();

        try {
          // eslint-disable-next-line no-await-in-loop
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
                user_id: user_id.to_string(),
                id: id.to_string(),
                fingerprint: device.fingerprint?.to_string() || null,
                token: device.token.to_string(),
                name: device.name,
                timestamp: luxon_to_neo4j(device.timestamp),
              }
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
        }
      }
    } catch (e) {
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
