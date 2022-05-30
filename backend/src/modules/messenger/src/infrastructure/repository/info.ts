//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { Driver, Neo4jError } from 'neo4j-driver';
import { Email, EmailID } from '../../domain/models/email';
import { SearchOptions } from '../../domain/models/search';
import { InfoRepository } from '../../domain/ports/info.repository';

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
}
