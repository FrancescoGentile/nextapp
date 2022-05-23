//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID, UserRole } from '@nextapp/common/user';
import { Driver, int, Neo4jError } from 'neo4j-driver';
import { SearchOptions } from '../../domain/models/search';
import { User } from '../../domain/models/user';
import { Username, Password } from '../../domain/models/user.credentials';
import { UserRepository } from '../../domain/ports/user.repository';

export class Neo4jUserRepository implements UserRepository {
  public constructor(private readonly driver: Driver) {}

  public static async create(driver: Driver): Promise<Neo4jUserRepository> {
    let session = driver.session();
    try {
      // unique constraint on ID
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT USER_unique_user_id IF NOT EXISTS
           FOR (u:USER_User)
           REQUIRE u.id IS UNIQUE`
        )
      );

      await session.close();
      session = driver.session();

      // unique constraint on username
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT USER_unique_username IF NOT EXISTS
           FOR (u:USER_User)
           REQUIRE u.username IS UNIQUE`
        )
      );

      return new Neo4jUserRepository(driver);
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_id_password(
    username: Username
  ): Promise<{ id: UserID; password: Password } | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:USER_User { username: $username })
           RETURN u.id as id, u.password as password`,
          { username: username.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const info = res.records[0];
      return {
        id: new UserID(info.get('id')),
        password: Password.from_hash(info.get('password')),
      };
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_user_role(user_id: UserID): Promise<UserRole | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:USER_User { id: $id })
           RETURN u.admin as admin`,
          { id: user_id.to_string() }
        )
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

  public async create_user(user: User): Promise<UserID | undefined> {
    const session = this.driver.session();
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const id = UserID.generate();

        try {
          // eslint-disable-next-line no-await-in-loop
          await session.writeTransaction((tx) =>
            tx.run(
              `CREATE (u:USER_User {
                id: $id,
                username: $username,
                password: $password,
                first_name: $first_name,
                middle_name: $middle_name,
                surname: $surname, 
                email: $email
              })`,
              {
                id: id.to_string(),
                username: user.username.to_string(),
                password: user.password.to_string(),
                first_name: user.first_name,
                middle_name: user.middle_name ?? null,
                surname: user.surname,
                email: user.email.to_string(),
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
          // there is already a user with the same username
          if (error.message.includes(user.username.to_string())) {
            return undefined;
          }
        }
      }
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_user_info(user_id: UserID): Promise<User | null> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:USER_User { id: $id })
           RETURN u`,
          { id: user_id.to_string() }
        )
      );

      if (res.records.length === 0) {
        return null;
      }

      const info = res.records[0].get('u').properties;

      return new User(
        info.first_name,
        info.middle_name,
        info.surname,
        info.admin,
        Username.from_string(info.username),
        Password.from_hash(info.password),
        info.email,
        new UserID(info.id)
      );
    } catch {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async get_users_list(options: SearchOptions): Promise<User[]> {
    const session = this.driver.session();
    try {
      const res = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (u:USER_User)
           RETURN u
           ORDER BY u.username
           SKIP $skip
           LIMIT $limit`,
          { skip: int(options.offset), limit: int(options.limit) }
        )
      );

      const users = res.records.map((record) => {
        const info = record.get('u').properties;
        return new User(
          info.first_name,
          info.middle_name,
          info.surname,
          info.admin,
          Username.from_string(info.username),
          Password.from_hash(info.password),
          info.email,
          new UserID(info.id)
        );
      });

      return users;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }

  public async change_role(user: UserID, role: UserRole): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(`MATCH (u:USER_User { id: $id }) SET u.admin = $admin`, {
          id: user.to_string(),
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

  public async change_password(
    user_id: UserID,
    password: Password
  ): Promise<boolean> {
    const session = this.driver.session();
    try {
      const res = await session.writeTransaction((tx) =>
        tx.run(
          `MATCH (u:USER_User { id: $id })
           SET u.password = $password`,
          { id: user_id.to_string(), password: password.to_string() }
        )
      );

      return res.summary.counters.updates().propertiesSet > 0;
    } catch {
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
          `MATCH (u:USER_User { id: $id })
           DETACH DELETE u`,
          { id: user_id.to_string() }
        )
      );
      return res.summary.counters.updates().nodesDeleted > 0;
    } catch (e) {
      throw new InternalServerError();
    } finally {
      await session.close();
    }
  }
}
