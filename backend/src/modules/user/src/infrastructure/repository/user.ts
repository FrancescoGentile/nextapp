//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID, UserRole } from '@nextapp/common/user';
import { Driver } from 'neo4j-driver';
import { User } from '../../domain/models/user';
import { Username, Password } from '../../domain/models/user.credentials';
import { UserRepository } from '../../domain/ports/user.repository';

export class Neo4jUserRepository implements UserRepository {
  public constructor(private readonly driver: Driver) {}
  
  delete_user(user_id: UserID): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  
  public static async create(driver: Driver): Promise<Neo4jUserRepository> {
    let session = driver.session();
    try {
      // unique constraint on ID
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT USER_unique_room_id IF NOT EXISTS
           FOR (u:USER_Room)
           REQUIRE u.id IS UNIQUE`
        )
      );

      await session.close();
      session = driver.session();

      // unique constraint on name
      await session.writeTransaction((tx) =>
        tx.run(
          `CREATE CONSTRAINT USER_unique_user_name IF NOT EXISTS
           FOR (u:USER_Room)
           REQUIRE u.name IS UNIQUE`
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
  
  get_user_role(user_id: UserID): Promise<UserRole | null> {
    throw new Error('Method not implemented.');
  }

  create_user(user: User): Promise<UserID> {
      throw new Error('Method not implemented.');
  }
  check_username(username: Username): Promise<boolean> {
      throw new Error('Method not implemented.');
  }
  check_system_administrator(user_id: UserID): Promise<boolean> {
      throw new Error('Method not implemented.');
  }
  get_user_list(): Promise<User[]> {
    throw new Error('Method not implemented.');
  }
  change_role(admin_to_down: UserID, role: UserRole): Promise<void> {
    throw new Error('Method not implemented.');
  }
  get_user_info(user_id: UserID): Promise<User> {
    throw new Error('Method not implemented.');
  }
  get_user_info_by_username(username: Username): Promise<User> {
    throw new Error('Method not implemented.');
  }
}
