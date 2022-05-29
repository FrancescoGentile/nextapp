//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { Driver, Neo4jError } from 'neo4j-driver';
import { User } from '../../domain/models/user';
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

  public async create_user(user: User): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE (u:MESSENGER_User {
                id: $id, 
                email: $email
            })`,
          { id: user.id.to_string(), email: user.email.to_string() }
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
