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
          `CREATE (u:MESSENGER_User { id: $user_id })-[t:MESSENGER_MEDIUM]->(e:MESSENGER_Email { id: $email_id, email: $email })`,
          {
            user_id: user_id.to_string(),
            email_id: EmailID.generate().to_string(),
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
}
