//
//
//

import { InternalServerError } from '@nextapp/common/error';
import { UserID, UserRole } from '@nextapp/common/user';
import { Driver } from 'neo4j-driver';
import { User } from '../../domain/models/user';
import { Username, Password, Credentials } from '../../domain/models/user.credentials';
import { UserRepository } from '../../domain/ports/user.repository';

export class Neo4jUserRepository implements UserRepository {
  public constructor(private readonly driver: Driver) {}
    save_user(user: User): Promise<UserID> {
        throw new Error('Method not implemented.');
    }
    check_username(username: Username): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    check_system_administrator(user_id: UserID): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
