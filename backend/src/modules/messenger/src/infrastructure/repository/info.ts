//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID } from '@nextapp/common/user';
import { Driver, Neo4jError } from 'neo4j-driver';
import { Email, EmailID } from '../../domain/models/email';
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

  private async get_emails(user_id: UserID): Promise<Email[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:MESSENGER_User { id: $id })-[m:MESSENGER_MEDIUM]->(e:MESSENGER_Email)
           RETURN e`,
          { id: user_id.to_string() }
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
  ): Promise<{ added: boolean; id?: EmailID | undefined }> {
    const session = this.driver.session();
    try {
      const emails = await this.get_emails(user_id);
      let id: EmailID = EmailID.generate();
      let found = false;
      while (!found) {
        found = true;
        id = EmailID.generate();
        // eslint-disable-next-line no-restricted-syntax
        for (const e of emails) {
          if (e.equals(email)) {
            return { added: false, id: e.id! };
          }
          if (e.id!.equals(id)) {
            found = false;
            break;
          }
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

      if (res.summary.counters.updates().nodesCreated === 0) {
        return { added: false, id: undefined };
      }
      return { added: true, id };
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
