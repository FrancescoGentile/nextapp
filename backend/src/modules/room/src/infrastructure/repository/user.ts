//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID, UserRole } from '@nextapp/common/user';
import { Driver, Neo4jError } from 'neo4j-driver';
import { User } from '../../domain/models/user';
import { UserRepository } from '../../domain/ports/user.repository';

export class Neo4jUserRepository implements UserRepository {
  private constructor(private driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jUserRepository> {
    const session = driver.session();
    try {
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT ROOM_unique_user_id IF NOT EXISTS
           FOR (u:ROOM_User)
           REQUIRE u.id IS UNIQUE`
        )
      );

      return new Neo4jUserRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  // ------------------------ USER ------------------------

  public async get_user_role(user_id: UserID): Promise<UserRole | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(`MATCH (u:ROOM_User { id: $id }) RETURN u.admin as admin`, {
          id: user_id.to_string(),
        })
      );

      if (res.records.length === 0) {
        return null;
      }

      const is_admin = res.records[0].get('admin');
      return is_admin ? UserRole.SYS_ADMIN : UserRole.SIMPLE;
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async set_user_role(
    user_id: UserID,
    role: UserRole
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(`MATCH (u:ROOM_User { id: $id }) SET u.admin = $admin`, {
          id: user_id.to_string(),
          admin: role === UserRole.SYS_ADMIN,
        })
      );

      return res.summary.counters.updates().propertiesSet > 0;
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
          `CREATE (u:ROOM_User {
              id: $id, 
              admin: $admin
            })`,
          { id: user.id.to_string(), admin: user.role === UserRole.SYS_ADMIN }
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
          `MATCH (u:ROOM_User { id: $id })
           DETACH DELETE u`,
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
}
